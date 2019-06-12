package com.lijiajie.springhadoop.spring_hadoop.spark;

import com.lijiajie.springhadoop.spring_hadoop.entity.kmeans;
import com.lijiajie.springhadoop.spring_hadoop.entity.linearRegresion;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.broadcast.Broadcast;
import org.apache.spark.mllib.linalg.Vector;
import org.apache.spark.mllib.linalg.Vectors;
import org.apache.spark.mllib.recommendation.MatrixFactorizationModel;
import org.apache.spark.mllib.recommendation.Rating;
import org.apache.spark.mllib.regression.*;
import org.apache.spark.rdd.RDD;
import scala.Tuple2;
import scala.Tuple3;
import scala.collection.immutable.Map;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

public class connect_scala_java {
    public HashMap<String, String> RecommendMovies(){
        Tuple2<RDD<Rating>, Map<Object, String>> movieTitle;
        movieTitle= new movie().PrepareData();
        MatrixFactorizationModel model = new movie().train(movieTitle._1, 3, 1, 0.1);
        HashMap<String, String> res = new movie().RecommendMovies(model, movieTitle._2, 4);
        return res;
        //test.RecommendMovies(movieTitle._1,movieTitle._2,2);
        //test.main(new String[]{});
    }
    public HashMap<String, String> RecommandUsers(){
        Tuple2<RDD<Rating>, Map<Object, String>> movieTitle;
        movieTitle= new movie().PrepareData();
        MatrixFactorizationModel model = new movie().train(movieTitle._1, 3, 10, 0.1);
        HashMap<String, String> res = new movie().RecommandUsers(model, movieTitle._2, 4);
        System.out.println(res);
        return res;
        //test.RecommendMovies(movieTitle._1,movieTitle._2,2);
        //test.main(new String[]{});
    }
    public kmeans getData(String path, String keys,String iteration){
        kmeans Kmeans=new kmeans();
        Tuple3<HashMap<String, String>, HashMap<String, String>,String> mapsRes = new movie().k_means(path,keys,iteration);
        java.util.Map<List<Double>,String> datas=new HashMap<>();
        java.util.Map<List<Double>,String> centers=new HashMap<>();
        Kmeans.setCost(mapsRes._3());
        for(String key:mapsRes._1().keySet()){
            List<Double> temp=transformer(key);
            datas.put(temp,mapsRes._1().get(key));
        }
        Kmeans.setKmeansDatas(datas);
        for(String key:mapsRes._2().keySet()){
            List<Double> temp=transformer(key);
            centers.put(temp,mapsRes._2().get(key));
        }
        Kmeans.setKmeansCenters(centers);
        //test.RecommendMovies(movieTitle._1,movieTitle._2,2);
        //test.main(new String[]{});
        return Kmeans;
    }

    public List<Double> transformer(String a){
        a=a.replace("[","");
        a=a.replace("]","");
        String[] b=a.split(",");
        List<Double> res=new ArrayList<>();
        for (String S:b){
            Double temp=0.0;
            temp=Double.parseDouble(S);
            res.add(temp);
        }
        return res;
    }

    public linearRegresion LinearRegresion(int flag){
        linearRegresion lr =new linearRegresion();
        SparkConf sparkConf = new SparkConf().setAppName("LinearRegresion").setMaster("local[*]");
        JavaSparkContext sc =  new JavaSparkContext(sparkConf);
        //原始的数据-0.4307829,-1.63735562648104 -2.00621178480549 ...
        JavaRDD<String> data = sc.textFile("/home/jiajie/line.txt");

        //转换数据格式：把每一行原始的数据(num1,num2 num3 ...)转换成LabeledPoint(label, features)
        JavaRDD<LabeledPoint> parsedData = data.filter(line -> {   //过滤掉不符合的数据行
            if(line.length() > 3)
                return true;
            return false;
        }).map(line -> {   //读取转换成LabeledPoint
            String[] parts = line.split(",");  //逗号分隔
            double[] ds = Arrays.stream(parts[1].split(" "))  //空格分隔
                    .mapToDouble(Double::parseDouble)
                    .toArray();
            return new LabeledPoint(Double.parseDouble(parts[0]), Vectors.dense(ds));
        });
        //rdd持久化内存中，后边反复使用，不必再从磁盘加载
        parsedData.cache();
        //设置迭代次数
        int numIterations = 100;
        //三种模型进行训练
        LinearRegressionModel linearModel = LinearRegressionWithSGD.train(parsedData.rdd(), numIterations);
        RidgeRegressionModel ridgeModel = RidgeRegressionWithSGD.train(parsedData.rdd(), numIterations);
        LassoModel lassoModel = LassoWithSGD.train(parsedData.rdd(), numIterations);
        HashMap<String,HashMap<Double,Double>> res=new HashMap<>();
        HashMap<Double, Double> liner=new HashMap<>();
        HashMap<Double, Double> ridge=new HashMap<>();
        HashMap<Double, Double> lasso=new HashMap<>();
        //打印信息
        List<Double> realD=new ArrayList<>();
        List<Double> preD=new ArrayList<>();
        if (flag==1){
            liner=print(parsedData, linearModel, sc);
        }else if(flag==2){
            liner=print(parsedData, ridgeModel, sc);
        }else {
            liner=print(parsedData, lassoModel, sc);
        }
        for(Double tempD:liner.keySet()){
            realD.add(tempD);
            preD.add(liner.get(tempD));
        }
        lr.setPredictData(preD);
        lr.setRealData(realD);
        lr.setLinerCost(0.0);
        //预测一条新数据方法，8个特征值
        /*double[] d = new double[]{1.0, 1.0, 2.0, 1.0, 3.0, -1.0, 1.0, -2.0};
        Vector v = Vectors.dense(d);
        System.out.println("Prediction of linear: "+linearModel.predict(v));
        System.out.println("Prediction of ridge: "+ridgeModel.predict(v));
        System.out.println("Prediction of lasso: "+lassoModel.predict(v));*/


//        //保存模型
//        model.save(sc.sc(),"myModelPath" );
//        //加载模型
//        LinearRegressionModel sameModel = LinearRegressionModel.load(sc.sc(), "myModelPath");

        //关闭
        sc.close();
        return lr;
    }

    /**
     *
     * @discription 统一输出方法
     * @author lijiajie
     * @created 2019年6月12日
     * @param parsedData
     * @param model
     */
    public static HashMap<Double, Double> print(JavaRDD<LabeledPoint> parsedData, GeneralizedLinearModel model, JavaSparkContext sc) {
        JavaPairRDD<Double, Double> valuesAndPreds = parsedData.mapToPair(point -> {
            double prediction = model.predict(point.features()); //用模型预测训练数据
            return new Tuple2<>(point.label(), prediction);
        });
        HashMap<Double, Double> res=new HashMap<>();
        Broadcast<HashMap<Double, Double>> broadcast=sc.broadcast(res);
        //打印训练集中的真实值与相对应的预测值
        valuesAndPreds.foreach((Tuple2<Double, Double> t) -> {
            broadcast.getValue().put(t._1(),t._2());
            System.out.println("训练集真实值："+t._1()+" ,预测值： "+t._2());
        });
        System.out.println(broadcast.value());
        //计算预测值与实际值差值的平方值的均值
        Double MSE = valuesAndPreds.mapToDouble((Tuple2<Double, Double> t) -> Math.pow(t._1() - t._2(), 2)).mean();
        System.out.println(model.getClass().getName() + " training Mean Squared Error = " + MSE);
        return broadcast.value();
    }
}
