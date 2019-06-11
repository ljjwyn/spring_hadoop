import breeze.math.MutablizingAdaptor.Lambda2
import org.apache.log4j.{Level, Logger}
import org.apache.spark.mllib.recommendation.{ALS, MatrixFactorizationModel, Rating}
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.SparkSession

object test {
  def setLogger = {
    Logger.getLogger("org").setLevel(Level.OFF)
    Logger.getLogger("com").setLevel(Level.OFF)
    System.setProperty("spark.ui.showConsoleProgress", "false")
    Logger.getRootLogger.setLevel(Level.OFF)
  }

  //读取用户已经评级过的电影
  def PrepareData(): (RDD[Rating], Map[Int, String]) = {
    val spark = SparkSession
      .builder()
      .appName("Movie Recommendation")
      .master("local")
      .getOrCreate()
    println("开始读取用户评分数据")
    val rawUserData = spark.sparkContext.textFile("/home/jiajie/ml-100k/u.data")
    val ratings = rawUserData.map(_.split("\t").take(3))
    //创建所需的评级数据集
    val ratinsRDD = ratings.map { case Array(user, movie, rating) => Rating(user.toInt, movie.toInt, rating.toDouble) }
    println("共计" + ratinsRDD.count.toString + "条数据")
    println("开始读取电影数据")
    val itemRDD = spark.sparkContext.textFile("/home/jiajie/ml-100k/u.item")
    val movieTitle = itemRDD.map(line => line.split("\\|").take(2)).map(array => (array(0).toInt, array(1))).collect().toMap
    val numRatings = ratinsRDD.count()
    val numUsers = ratinsRDD.map(_.user).distinct().count()
    val numMovies = ratinsRDD.map(_.product).distinct().count()
    println("共计--ratins:" + numRatings + " User:" + numUsers + " Movies:" + numMovies)
    (ratinsRDD, movieTitle)
  }

  def RecommendMovies(model: MatrixFactorizationModel, movieTitle: Map[Int, String], inputUserid: Int): Unit = {
    val RecommendMovie = model.recommendProducts(inputUserid, 10)
    var i = 1
    println("针对用户" + inputUserid + " 推荐下列电影：")
    RecommendMovie.foreach { r => println(i.toString() + "." + movieTitle(r.product) + " 评分：" + r.rating.toString()); i += 1 }
  }

  def RecommandUsers(model: MatrixFactorizationModel, movieTitle: Map[Int, String], inputMovieId: Int): Unit = {
    val RecommendUser = model.recommendUsers(inputMovieId, 10)
    var i = 1
    println("对这部电影可能感兴趣的用户")
    RecommendUser.foreach { r => println(i.toString + "." + movieTitle(r.user)) + " 评分:" + r.rating.toString(); i += 1 }
  }

  //提取用户已经评价过的电影数据用于与推荐的电影进行对比，检查推荐的电影数据是否合理
  def selectEvaluatedMovie(userId: Int, movieTitle: Map[Int, String]): Unit = {
    val spark = SparkSession
      .builder()
      .appName("selectEvaluatedMovie")
      .master("local")
      .getOrCreate()

    val ratingData = spark.sparkContext.textFile("/home/jiajie/ml-100k/u.data")
    val evaluatedTitle = ratingData.map(_.split("\t").take(2)).map(array => (array(0).toInt, array(1).toInt))
    val movieForUser = evaluatedTitle.lookup(userId)
    //println("用户总共评价"+movieForUser.count()+"部电影")
    println("用户已经评价过的电影标题如下：")
    movieForUser.foreach(movieId => println("    " + movieTitle(movieId)))
  }
  def train(ratings:RDD[Rating],rank:Int,iterable: Int,lambda:Double):MatrixFactorizationModel={
    val model = ALS.train(ratings, 5, 10, 0.1)
    (model)
  }

  def main(args: Array[String]) = {
    setLogger
    val (ratings, movieTitle) = PrepareData()
    val model = ALS.train(ratings, 3, 10, 0.1)
    //selectEvaluatedMovie(789, movieTitle)
    RecommendMovies(model, movieTitle, 4)
    //RecommandUsers(model, movieTitle, 6)
  }
}
