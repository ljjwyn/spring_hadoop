package com.lijiajie.springhadoop.spring_hadoop.spark

import org.apache.log4j.{Level, Logger}
import org.apache.spark.mllib.recommendation.{ALS, MatrixFactorizationModel, Rating}
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.SparkSession
import org.apache.spark.SparkConf
import org.apache.spark.SparkContext
import org.apache.spark.mllib.clustering.KMeans
import org.apache.spark.mllib.linalg.Vectors
import scala.collection.JavaConversions.mapAsScalaMap


class movie {
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

  def RecommendMovies(model: MatrixFactorizationModel, movieTitle: Map[Int, String], inputUserid: Int):(java.util.HashMap[String,String])= {
    val RecommendMovie = model.recommendProducts(inputUserid, 10)
    var i = 1
    var maps = new java.util.HashMap[String,String]()
    println("针对用户" + inputUserid + " 推荐下列电影：")
    //RecommendMovie.foreach { r =>movie.::(movieTitle(r.product));rating.::(r.rating.toString());i+=1}
    RecommendMovie.foreach { r => println(i.toString() + "." + movieTitle(r.product) + " 评分：" + r.rating.toString());maps.put(movieTitle(r.product),r.rating.toString()); i += 1 }
    (maps)
  }

  def RecommandUsers(model: MatrixFactorizationModel, movieTitle: Map[Int, String], inputMovieId: Int): (java.util.HashMap[String,String]) = {
    val RecommendUser = model.recommendUsers(inputMovieId, 10)
    var i = 1
    val maps = new java.util.HashMap[String,String]()
    println("对这部电影可能感兴趣的用户")
    RecommendUser.foreach { r => println(i.toString + "." + movieTitle(r.user)) + " 评分:" + r.rating.toString(); maps+=(movieTitle(r.product)->r.rating.toString());i += 1 }
    (maps)
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
    val model = ALS.train(ratings, 3, 8, 0.1)
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


  def k_means(path:String, keys:String, iteration:String):(java.util.HashMap[String,String],java.util.HashMap[String,String],String)={
    val conf = new SparkConf()
    conf.setMaster("local").setAppName("K-Means 1")
    val sc = new SparkContext(conf)
    val rawtxt = sc.textFile(path)

    // 将文本文件的内容转化为 Double 类型的 Vector 集合
    val allData = rawtxt.map {
      line =>
        Vectors.dense(line.split(' ').map(_.toDouble))
    }

    // 由于 K-Means 算法是迭代计算，这里把数据缓存起来（广播变量）
    allData.cache()
    // 分为 3 个子集，最多50次迭代
    val kMeansModel = KMeans.train(allData, keys.toInt, iteration.toInt)
    // 输出每个子集的质心
    var javaScores = new java.util.HashMap[String,String]()
    val ScoresBroadCast = sc.broadcast(javaScores)
    var i=1;
    kMeansModel.clusterCenters.foreach {V=>println;ScoresBroadCast.value+=(V.toString->i.toString);i+=1;}
    val kMeansCost = kMeansModel.computeCost(allData)
    // 输出本次聚类操作的收敛性，此值越低越好
    println("K-Means Cost: " + kMeansCost)
    var maps = new java.util.HashMap[String, String]()
    val accum = sc.collectionAccumulator[java.util.HashMap[String, String]]("My Accumulator")
    val resultBroadCast = sc.broadcast(maps)
    //var map1:Map[String,String]=Map();
    // 输出每组数据及其所属的子集索引
    allData.foreach {
      vec =>
        println(kMeansModel.predict(vec) + ": " + vec);
        resultBroadCast.value += (vec.toString->kMeansModel.predict(vec).toString);
    }
    maps=resultBroadCast.value
    javaScores=ScoresBroadCast.value
    System.out.print(maps)
    System.out.print(javaScores)
    sc.stop()
    (maps,javaScores,kMeansCost.toString)
  }

}
