package com.lijiajie.springhadoop.spring_hadoop.controller;

import java.lang.reflect.Array;
import java.util.*;

import com.alibaba.fastjson.JSONObject;
import org.apache.commons.lang.StringUtils;
import org.apache.hadoop.fs.BlockLocation;
import org.apache.spark.sql.sources.In;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.lijiajie.springhadoop.spring_hadoop.entity.pathInfo;
import com.lijiajie.springhadoop.spring_hadoop.service.HdfsService;
import com.lijiajie.springhadoop.spring_hadoop.util.loadPathInfo;
import com.lijiajie.springhadoop.spring_hadoop.spark.SparkJob;
import com.lijiajie.springhadoop.spring_hadoop.spark.connect_scala_java;

@RestController
@RequestMapping("/hadoop/hdfs")
public class HdfsAction {

    private static Logger LOGGER = LoggerFactory.getLogger(HdfsAction.class);

    /**
     * 读取HDFS目录信息
     * @param str
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/readPathInfo", method=RequestMethod.POST,
            produces={"application/json;charset=UTF-8"})
    public Map<String, List<pathInfo>> readPathInfo(@RequestBody String str) throws Exception {
        Map<String, Object> resquestParams = JSONObject.parseObject(str, Map.class);
        String path=(String)resquestParams.get("path");
        System.out.println("path"+path);
        List<pathInfo> resInfo = new ArrayList<>();
        loadPathInfo loadinfo=new loadPathInfo();
        List<Map<String, Object>> list = HdfsService.readPathInfo(path);
        resInfo=loadinfo.getInfo(list,path);
        Map<String,List<pathInfo>> res = new HashMap<>();
        res.put("result",resInfo);
        return res;
    }

    /**
     * 上传文件
     * @param path
     * @param uploadPath
     * @return
     * @throws Exception
     */
    @PostMapping("/uploadFile")
    public String uploadFile(@RequestParam("path") String path, @RequestParam("uploadPath") String uploadPath)
            throws Exception {
        HdfsService.uploadFile(path, uploadPath);
        return "upload file success";
    }

    /**
     * 创建文件
     * @param path
     * @return
     * @throws Exception
     */
    @PostMapping("/createFile")
    public String createFile(@RequestParam("path") String path, @RequestParam("file") MultipartFile file)
            throws Exception {
        if (StringUtils.isEmpty(path) || null == file.getBytes()) {
            return "请求参数为空";
        }
        HdfsService.createFile(path, file);
        return "创建文件成功";
    }

    /**
     * 读取HDFS文件内容
     * @param str
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/readFile", method=RequestMethod.POST,
            produces={"application/json;charset=UTF-8"})
    public Map<String,String> readFile(@RequestBody String str) throws Exception {
        Map<String,String> res= new HashMap<>();
        Map<String,String> wordConut= new HashMap<>();
        Map<String, Object> resquestParams = JSONObject.parseObject(str, Map.class);
        String path=(String)resquestParams.get("path");
        String targetPath = HdfsService.readFile(path);
        res.put("result",targetPath);
        return res;
    }

    /**
     * 调用spark实现文本计数
     * @param str
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/wordCount", method=RequestMethod.POST,
            produces={"application/json;charset=UTF-8"})
    public Map<String,Object> wordCount(@RequestBody String str) throws Exception {
        Map<String,Object> res= new HashMap<>();
        Map<String,Integer> wordConut= new HashMap<>();
        List<String> key = new ArrayList<>();
        List<Integer> value = new ArrayList<>();
        Map<String, Object> resquestParams = JSONObject.parseObject(str, Map.class);
        String path=(String)resquestParams.get("path");
        System.out.println("wordpath"+path);
        SparkJob SJ = new SparkJob();
        wordConut=SJ.wordCount(path);
        wordConut=sort(wordConut);
        int i=0;
        for(String wkey:wordConut.keySet()){
            i+=1;
            key.add(wkey);
            value.add(wordConut.get(wkey));
            if(i==12){
                break;
            }
        }
        System.out.println(wordConut);
        res.put("result",wordConut.toString());
        res.put("key", key);
        res.put("value", value);
        return res;
    }


    @RequestMapping(value = "/Kmeans", method=RequestMethod.POST,
            produces={"application/json;charset=UTF-8"})
    public Map<List<Double>,String> Kmeans(@RequestBody String str) throws Exception {
        Map<String, Object> res = new HashMap<>();
        Map<String, Integer> wordConut = new HashMap<>();
        Map<String, Object> resquestParams = JSONObject.parseObject(str, Map.class);
        String path = (String) resquestParams.get("path");
        String keys=(String) resquestParams.get("keys");
        String iteration=(String) resquestParams.get("iteration");
        connect_scala_java conn =new connect_scala_java();
        //HashMap<String, String> testMap = conn.getcenter();
        HashMap<String, String> testMap1 = conn.getData(path,keys,iteration);
        Map<List<Double>,String> resMap=new HashMap<>();
        for(String key:testMap1.keySet()){
            List<Double> temp=transformer(key);
            resMap.put(temp,testMap1.get(key));
        }
        //HashMap<String, String> testMap2 = conn.RecommendMovies();
        //HashMap<String, String> testMap3 = conn.RecommandUsers();
        System.out.println(testMap1);
        return resMap;
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

    public Map<String,Integer> sort(Map<String,Integer> wordConut){
        Map<String,Integer> res=new LinkedHashMap<>();
        List<Map.Entry<String,Integer>> list = new ArrayList<Map.Entry<String, Integer>>(wordConut.entrySet());
        Collections.sort(list,new Comparator<Map.Entry<String,Integer>>() {
            //升序排序
            public int compare(Map.Entry<String, Integer> o1,
                               Map.Entry<String, Integer> o2) {
                return o2.getValue().compareTo(o1.getValue());
            }

        });
        for(Map.Entry<String,Integer> mapping:list){
            res.put(mapping.getKey(),mapping.getValue());
        }
        return res;
    }
}
