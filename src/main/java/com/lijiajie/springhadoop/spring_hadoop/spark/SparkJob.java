package com.lijiajie.springhadoop.spring_hadoop.spark;

import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.ml.clustering.BisectingKMeans;
import org.apache.spark.ml.clustering.BisectingKMeansModel;
import org.apache.spark.ml.linalg.Vector;
import org.apache.spark.mllib.linalg.Vectors;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import scala.Tuple2;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Created by Administrator on 2016/7/24 0024.
 */
public class SparkJob {
    private static final Pattern SPACE = Pattern.compile(" ");

    public Map<String,Integer> wordCount(String path) throws Exception {

        String args = path;

        if (args.length() < 1) {
            System.err.println("Usage: JavaWordCount <file>");
            System.exit(1);
        }

        SparkSession spark = SparkSession.builder().appName("JavaWordCount").master("local").getOrCreate();

        // SparkConf conf = new
        // SparkConf().setAppName("ingini-spark-java8").setMaster("local");

        JavaRDD<String> lines = spark.read().textFile(args).javaRDD();

        JavaRDD<String> words = lines.flatMap(line -> Arrays.asList(line.split(" ")).iterator());

        JavaPairRDD<String, Integer> counts = words.mapToPair(w -> new Tuple2<String, Integer>(w, 1))
                .reduceByKey((x, y) -> x + y);
        // counts.collect();

        List<Tuple2<String, Integer>> output = counts.collect();
        Map<String,Integer> res = new HashMap<>();
        for (Tuple2<?, ?> tuple : output) {
            res.put((String)tuple._1,(Integer) tuple._2());
            System.out.println(tuple._1() + ":== " + tuple._2());
            System.out.println(res);
        }
        spark.stop();
        return res;
    }

    public void calculate_k_means() throws IOException {
        SparkSession spark = SparkSession
                .builder()
                .master("local")
                .appName("JavaBisectingKMeansExample")
                .getOrCreate();

        // $example on$
        // Loads data.
        Dataset<Row> dataset = spark.read().format("libsvm").load("/home/jiajie/iris_libsvm.txt");
        // Trains a bisecting k-means model.
        BisectingKMeans bkm = new BisectingKMeans().setK(3).setSeed(2);
        BisectingKMeansModel model = bkm.fit(dataset);

        // Evaluate clustering.
        double cost = model.computeCost(dataset);
        System.out.println("Within Set Sum of Squared Errors = " + cost);

        // Shows the result.
        System.out.println("Cluster Centers: ");
        Vector[] centers = model.clusterCenters();
        for (Vector center : centers) {
            System.out.println(center);
        }
        // $example off$

        spark.stop();
    }

}