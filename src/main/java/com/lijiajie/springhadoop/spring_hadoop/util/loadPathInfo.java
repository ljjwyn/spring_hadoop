package com.lijiajie.springhadoop.spring_hadoop.util;

import com.lijiajie.springhadoop.spring_hadoop.entity.pathInfo;

import javax.sql.rowset.spi.SyncResolver;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class loadPathInfo {


    public List<pathInfo> getInfo(List<Map<String, Object>> list, String url){
        List<pathInfo> infoList = new ArrayList<>();
        for (Map<String, Object> info:list){
            pathInfo itemInfo = new pathInfo();
            Object obj = new Object();
            obj=info.get("fileStatus");
            String basicInfo=obj.toString();
            String rexPath;
            if (url.equals("/")){
                rexPath=".*path=hdfs://localhost:9000/+(\\S+?)($|;|\\s+.+)";
            }else {
                rexPath=".*path=hdfs://localhost:9000"+url+"/+(\\S+?)($|;|\\s+.+)";
            }
            String name=pattern(basicInfo, rexPath);
            name=name.substring(0,name.length()-1);
            itemInfo.setName(name);
            String isdirectory=pattern(basicInfo, ".*isDirectory=+(\\S+?)($|;|\\s+.+)");
            isdirectory=isdirectory.substring(0,isdirectory.length()-1);
            itemInfo.setIsD(isdirectory);
            String modifiedTime=pattern(basicInfo,".*modification_time=+(\\S+?)($|;|\\s+.+)");
            modifiedTime=modifiedTime.substring(0,modifiedTime.length()-1);
            String modifiedDate=stampToDate(modifiedTime);
            itemInfo.setModeifyDate(modifiedDate);
            String owner=pattern(basicInfo,".*owner=+(\\S+?)($|;|\\s+.+)");
            owner=owner.substring(0,owner.length()-1);
            itemInfo.setOwner(owner);
            String size;
            if (isdirectory.equals("true")){
                size="0B";
            }else {
                size=pattern(basicInfo,".*length=+(\\S+?)($|;|\\s+.+)");
                size=size.substring(0,size.length()-1);
                size=size+"B";
            }
            itemInfo.setSize(size);
            String permission=pattern(basicInfo,".*permission=+(\\S+?)($|;|\\s+.+)");
            permission=permission.substring(0,permission.length()-1);
            itemInfo.setPermission(permission);
            System.out.println(name);
            System.out.println(isdirectory);
            infoList.add(itemInfo);
            System.out.println(infoList);
        }
        return infoList;
    }

    public String pattern(String str,String regex){
        Pattern r1 = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher m1 = r1.matcher(str);
        if (!m1.matches()) {
            throw new IllegalArgumentException("Bad Input");
        }
        return m1.group(1);

    }

    /*
     * 将时间戳转换为时间
     */
    public String stampToDate(String s){
        String res;
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        long lt = new Long(s);
        Date date = new Date(lt);
        res = simpleDateFormat.format(date);
        return res;
    }
}
