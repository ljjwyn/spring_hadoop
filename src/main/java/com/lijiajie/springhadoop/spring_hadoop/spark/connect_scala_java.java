package com.lijiajie.springhadoop.spring_hadoop.spark;

import com.lijiajie.springhadoop.spring_hadoop.spark.movie;
import org.apache.spark.mllib.recommendation.MatrixFactorizationModel;
import org.apache.spark.mllib.recommendation.Rating;
import org.apache.spark.rdd.RDD;
import scala.Tuple2;
import scala.collection.immutable.Map;
import java.util.HashMap;

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
    public HashMap<String, String> getcenter(){
        Tuple2<HashMap<String, String>, HashMap<String, String>> mapsRes = new movie().k_means("hdfs://127.0.0.1:9000/jiajie/soccer.txt","3","50");
        System.out.println(mapsRes._2);
        return mapsRes._2;
        //test.RecommendMovies(movieTitle._1,movieTitle._2,2);
        //test.main(new String[]{});
    }
    public HashMap<String, String> getData(String path, String keys,String iteration){
        Tuple2<HashMap<String, String>, HashMap<String, String>> mapsRes = new movie().k_means(path,keys,iteration);
        System.out.println(mapsRes._1());
        return mapsRes._1;
        //test.RecommendMovies(movieTitle._1,movieTitle._2,2);
        //test.main(new String[]{});
    }
}
