package com.lijiajie.springhadoop.spring_hadoop.entity;

import java.util.List;

public class linearRegresion {
    private List<Double> realData;

    private List<Double> predictData;

    private Double cost;

    public void setRealData(List<Double> D){
        this.realData=D;
    }
    public List<Double> getRealData(){
        return this.realData;
    }
    public void setPredictData(List<Double> D){
        this.predictData=D;
    }
    public List<Double> getPredictData(){
        return this.predictData;
    }
    public void setLinerCost(Double C){
        this.cost=C;
    }
    public Double getLinerCost(){
        return this.cost;
    }
}
