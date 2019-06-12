package com.lijiajie.springhadoop.spring_hadoop.entity;

import java.util.List;
import java.util.Map;

public class  kmeans {
    private String cost;

    private Map<List<Double>,String> kmeansDatas;

    private Map<List<Double>,String> kmeansCenters;

    public void setCost(String C){
        this.cost=C;
    }
    public String getCost(){
        return this.cost;
    }
    public void setKmeansDatas(Map<List<Double>,String> data){
        this.kmeansDatas=data;
    }
    public Map<List<Double>,String> getKmeansDatas(){
        return this.kmeansDatas;
    }
    public void setKmeansCenters(Map<List<Double>,String> centers){
        this.kmeansCenters=centers;
    }
    public Map<List<Double>,String> getKmeansCenters(){
        return this.kmeansCenters;
    }

}
