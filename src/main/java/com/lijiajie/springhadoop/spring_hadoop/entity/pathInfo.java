package com.lijiajie.springhadoop.spring_hadoop.entity;

import java.util.Date;

public class pathInfo {

    private String name;

    private String size;

    private String modeifyDate;

    private String permission;

    private String isD;

    private String owner;

    public void setName(String names){
        this.name=names;
    }
    public String getName(){
        return this.name;
    }
    public void setIsD(String names){
        this.isD=names;
    }
    public String getIsD(){
        return this.isD;
    }
    public void setPermission(String names){
        this.permission=names;
    }
    public String getPermission(){
        return this.permission;
    }
    public void setSize(String s){
        this.size=s;
    }
    public String getSize(){
        return this.size;
    }
    public void setOwner(String names){
        this.owner=names;
    }
    public String getOwner(){
        return this.owner;
    }
    public void setModeifyDate(String createDate1){
        this.modeifyDate=createDate1;
    }
    public String getModeifyDate(){
        return this.modeifyDate;
    }

}
