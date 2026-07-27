---
title: Java对接腾讯云IM
date: 2023-03-20 02:54:34
categories: 技术分享
tags:
  - Java
  - 开发
  - 笔记
description: 最近做的一期项目有用到腾讯云IM的内容，差不多完结了做一下总结归纳
---
> 你好

# 简介

介绍如何在Java项目中集成腾讯云IM，包括工具类、对应常量类，api调用方法、IM后台配置单聊之前回调以及个别踩坑点

# 腾讯云相关

## 登录腾讯云账号

[https://cloud.tencent.com/login?s_url=https://cloud.tencent.com/](https://cloud.tencent.com/login?s_url=https://cloud.tencent.com/)

## 创建即时通讯IM应用

![[Untitled 28.png]]

在控制台找到`即时通讯IM`

![[Untitled 29.png]]

`创建新应用`

![[Untitled 30.png]]

SDKAppID与密钥后续在项目中会用到

## 相关文档和工具

[https://cloud.tencent.com/document/product/269/32688](https://cloud.tencent.com/document/product/269/32688)

[https://tcc.tencentcs.com/im-api-tool/index.html#/v4/openim/sendmsg](https://tcc.tencentcs.com/im-api-tool/index.html#/v4/openim/sendmsg)

# Java相关

## POM包引入

```xml
<dependencies>
    <dependency>
        <groupId>com.github.tencentyun</groupId>
        <artifactId>tls-sig-api-v2</artifactId>
        <version>2.0</version>
    </dependency>
</dependencies>
```

## 常量类

### 即时通讯回调命令常数

```java
/**
 * 即时通讯回调命令常数
 *
 * @author zealerg
 * @date 2023/03/13 14:14
 **/
public class ImCallbackCommandConstant {
    /**
     * 单聊消息
     */
    public static class SingleChat {
        /**
         * 发单聊消息之前回调
         */
        public static final String BEFORE_SEND_MSG = "C2C.CallbackBeforeSendMsg";
        /**
         * 发单聊消息之后回调
         */
        public static final String AFTER_SEND_MSG = "C2C.CallbackAfterSendMsg";
        /**
         * 单聊消息已读上报后回调
         */
        public static final String AFTER_MSG_REPORT = "C2C.CallbackAfterMsgReport";
        /**
         * 单聊消息撤回后回调
         */
        public static final String AFTER_MSG_WITH_DRAW = "C2C.CallbackAfterMsgWithDraw";
    }
}
```

### 即时通讯消息类别常数

```java
/**
 * 即时通讯消息类别常数
 *
 * @author zealerg
 * @date 2023/03/13 14:14
 **/
public class ImMsgTypeConstant {
    /**
     * 文本
     */
    public static final String TEXT = "TIMTextElem";
    /**
     * 位置
     */
    public static final String LOCATION = "TIMLocationElem";
    /**
     * 表情
     */
    public static final String FACE = "TIMFaceElem";
    /**
     * 自定义
     */
    public static final String CUSTOM = "TIMCustomElem";
    /**
     * 语音
     */
    public static final String SOUND = "TIMSoundElem";
    /**
     * 图像
     */
    public static final String IMAGE = "TIMImageElem";
    /**
     * 文件
     */
    public static final String FILE = "TIMFileElem";
    /**
     * 视频文件
     */
    public static final String VIDEO_FILE = "TIMVideoFileElem";
}
```

### 即时通讯资料标签常数

这里由于需求只涉及到这两个常数所以就没有补全

[全部的资料标签](https://cloud.tencent.com/document/product/269/1500#.E6.A0.87.E9.85.8D.E8.B5.84.E6.96.99.E5.AD.97.E6.AE.B5)

```java
/**
 * 即时通讯资料标签常数
 *
 * @author zealerg
 * @date 2023/03/17 15:53
 **/
public class ImProfileTagConstant {

    /**
     * 名字
     */
    public static final String NAME = "Tag_Profile_IM_Nick";
    /**
     * 头像URL
     */
    public static final String IMAGE = "Tag_Profile_IM_Image";
}
```

### 即时通讯api常数

```java
/**
 * 腾讯即时通讯api常数
 *
 * @author zealerg
 * @date 2023/03/08 14:36
 */
public class TencentImApiConstant {

    /**
     * 账号管理
     */
    public static class AccountManage {
        /**
         * 导入单个账号
         */
        public static final String ACCOUNT_IMPORT = "v4/im_open_login_svc/account_import";
        /**
         * 导入多个账号
         */
        public static final String MULTI_ACCOUNT_IMPORT = "v4/im_open_login_svc/multiaccount_import";
        /**
         * 删除账号
         */
        public static final String ACCOUNT_DELETE = "v4/im_open_login_svc/account_delete";
        /**
         * 查询账号
         */
        public static final String ACCOUNT_CHECK = "v4/im_open_login_svc/account_check";
        /**
         * 失效账号登录状态
         */
        public static final String ACCOUNT_KICK = "v4/im_open_login_svc/kick";
        /**
         * 查询账号在线状态
         */
        public static final String ACCOUNT_QUERY_STATE = "v4/openim/query_online_status";
    }

    /**
     * 单聊消息
     */
    public static class SingleChatManage {
        /**
         * 单发单聊消息
         */
        public static final String SEND_MSG = "v4/openim/sendmsg";
        /**
         * 批量发单聊消息
         */
        public static final String BATCH_SEND_MSG = "v4/openim/batchsendmsg";
        /**
         * 导入单聊消息
         */
        public static final String IMPORT_MSG = "v4/openim/importmsg";
        /**
         * 查询单聊消息
         */
        public static final String ADMIN_GET_ROAM_MSG = "v4/openim/admin_getroammsg";
        /**
         * 撤回单聊消息
         */
        public static final String ADMIN_MSG_WITH_DRAW = "v4/openim/admin_msgwithdraw";
        /**
         * 设置单聊消息已读
         */
        public static final String ADMIN_SET_MSG_READ = "v4/openim/admin_set_msg_read";
        /**
         * 查询单聊未读消息计数
         */
        public static final String ADMIN_SET_MSG_UNREAD_SUM = "v4/openim/get_c2c_unread_msg_num";
    }

    /**
     * 全员推送
     */
    public static class AllPushManage {
        /**
         * 全员推送
         */
        public static final String IM_PUSH = "v4/all_member_push/im_push";
        /**
         * 设置应用属性名称
         */
        public static final String IM_SET_ATTR_NAME = "v4/all_member_push/im_set_attr_name";
        /**
         * 获取应用属性名称
         */
        public static final String IM_GET_ATTR_NAME = "v4/all_member_push/im_get_attr_name";
        /**
         * 获取用户属性
         */
        public static final String IM_GET_ATTR = "v4/all_member_push/im_get_attr";
        /**
         * 设置用户属性
         */
        public static final String IM_SET_ATTR = "v4/all_member_push/im_set_attr";
        /**
         * 删除用户属性
         */
        public static final String IM_REMOVE_ATTR = "v4/all_member_push/im_remove_attr";
        /**
         * 获取用户标签
         */
        public static final String IM_GET_TAG = "v4/all_member_push/im_get_tag";
        /**
         * 添加用户标签
         */
        public static final String IM_ADD_TAG = "v4/all_member_push/im_add_tag";
        /**
         * 删除用户标签
         */
        public static final String IM_REMOVE_TAG = "v4/all_member_push/im_remove_tag";
        /**
         * 删除用户所有标签
         */
        public static final String IM_REMOVE_ALL_TAGS = "v4/all_member_push/im_remove_all_tags";
    }

    /**
     * 资料管理
     */
    public static class PortraitManage {
        /**
         * 设置资料
         */
        public static final String PORTRAIT_SET = "v4/profile/portrait_set";
        /**
         * 拉取资料
         */
        public static final String PORTRAIT_GET = "v4/profile/portrait_get";
    }

    /**
     * 关系链管理
     */
    public static class RelationManage {
        /**
         * 添加好友
         */
        public static final String FRIEND_ADD = "v4/sns/friend_add";
        /**
         * 导入好友
         */
        public static final String FRIEND_IMPORT = "v4/sns/friend_import";
        /**
         * 更新好友
         */
        public static final String FRIEND_UPDATE = "v4/sns/friend_update";
        /**
         * 删除好友
         */
        public static final String FRIEND_DELETE = "v4/sns/friend_delete";
        /**
         * 删除所有好友
         */
        public static final String FRIEND_DELETE_ALL = "v4/sns/friend_delete_all";
        /**
         * 校验好友
         */
        public static final String FRIEND_CHECK = "v4/sns/friend_check";
        /**
         * 拉取好友
         */
        public static final String FRIEND_GET = "v4/sns/friend_get";
        /**
         * 拉取指定好友
         */
        public static final String FRIEND_GET_LIST = "v4/sns/friend_get_list";
        /**
         * 添加黑名单
         */
        public static final String BLACK_LIST_ADD = "v4/sns/black_list_add";
        /**
         * 删除黑名单
         */
        public static final String BLACK_LIST_DELETE = "v4/sns/black_list_delete";
        /**
         * 拉取黑名单
         */
        public static final String BLACK_LIST_GET = "v4/sns/black_list_get";
        /**
         * 校验黑名单
         */
        public static final String BLACK_LIST_CHECK = "v4/sns/black_list_check";
        /**
         * 添加分组
         */
        public static final String GROUP_ADD = "v4/sns/group_add";
        /**
         * 删除分组
         */
        public static final String GROUP_DELETE = "v4/sns/group_delete";
        /**
         * 拉取分组
         */
        public static final String GROUP_GET = "v4/sns/group_get";
    }

    /**
     * 最近联系人
     */
    public static class RecentContactManage {
        /**
         * 拉取会话列表
         */
        public static final String GET_LIST = "v4/recentcontact/get_list";
        /**
         * 删除单个会话
         */
        public static final String DELETE = "v4/recentcontact/delete";
    }

    /**
     * 群组管理
     */
    public static class GroupManage {
        /**
         * App 管理员可以通过该接口获取 App 中所有群组的 ID。
         */
        public static final String GET_ALL_GROUP_ID = "v4/group_open_http_svc/get_appid_group_list";
        /**
         * 创建群组
         */
        public static final String CREATE_GROUP = "v4/group_open_http_svc/create_group";
        /**
         * 获取群详细资料
         */
        public static final String GET_GROUP_INFO = "v4/group_open_http_svc/get_group_info";
        /**
         * 获取群成员详细资料
         */
        public static final String GET_GROUP_MEMBER_INFO = "v4/group_open_http_svc/get_group_member_info";
        /**
         * 修改群基础资料
         */
        public static final String MODIFY_GROUP_BASE_INFO = "v4/group_open_http_svc/modify_group_base_info";
        /**
         * 增加群成员
         */
        public static final String ADD_GROUP_MEMBER = "v4/group_open_http_svc/add_group_member";
        /**
         * 删除群成员
         */
        public static final String DELETE_GROUP_MEMBER = "v4/group_open_http_svc/delete_group_member";
        /**
         * 修改群成员资料
         */
        public static final String MODIFY_GROUP_MEMBER_INFO = "v4/group_open_http_svc/modify_group_member_info";
        /**
         * 解散群组
         */
        public static final String DESTROY_GROUP = "v4/group_open_http_svc/destroy_group";
        /**
         * 获取用户所加入的群组
         */
        public static final String GET_JOINED_GROUP_LIST = "v4/group_open_http_svc/get_joined_group_list";
        /**
         * 查询用户在群组中的身份
         */
        public static final String GET_ROLE_IN_GROUP = "v4/group_open_http_svc/get_role_in_group";
        /**
         * 批量禁言和取消禁言
         */
        public static final String FORBID_SEND_MSG = "v4/group_open_http_svc/forbid_send_msg";
        /**
         * 获取被禁言群成员列表
         */
        public static final String GET_GROUP_SHUT_UIN = "v4/group_open_http_svc/get_group_shutted_uin";
        /**
         * 在群组中发送普通消息
         */
        public static final String SEND_GROUP_MSG = "v4/group_open_http_svc/send_group_msg";
        /**
         * 在群组中发送系统通知
         */
        public static final String SEND_GROUP_SYSTEM_NOTIFICATION = "v4/group_open_http_svc/send_group_system_notification";
        /**
         * 撤回群消息
         */
        public static final String GROUP_MSG_RECALL = "v4/group_open_http_svc/group_msg_recall";
        /**
         * 转让群主
         */
        public static final String CHANGE_GROUP_OWNER = "v4/group_open_http_svc/change_group_owner";
        /**
         * 导入群基础资料
         */
        public static final String IMPORT_GROUP = "v4/group_open_http_svc/import_group";
        /**
         * 导入群消息
         */
        public static final String IMPORT_GROUP_MSG = "v4/group_open_http_svc/import_group_msg";
        /**
         * 导入群成员
         */
        public static final String IMPORT_GROUP_MEMBER = "v4/group_open_http_svc/import_group_member";
        /**
         * 设置成员未读消息计数
         */
        public static final String SET_UNREAD_MSG_NUM = "v4/group_open_http_svc/set_unread_msg_num";
        /**
         * 删除指定用户发送的消息
         */
        public static final String DELETE_GROUP_MSG_BY_SENDER = "v4/group_open_http_svc/delete_group_msg_by_sender";
        /**
         * 拉取群历史消息
         */
        public static final String GROUP_MSG_GET_SIMPLE = "v4/group_open_http_svc/group_msg_get_simple";
        /**
         * 获取直播群在线人数
         */
        public static final String GET_ONLINE_MEMBER_NUM = "v4/group_open_http_svc/get_online_member_num";
    }

    /**
     * 全局禁言管理
     */
    public static class AllSinentManage {
        /**
         * 设置全局禁言
         */
        public static final String SET_NO_SPEAKING = "v4/openconfigsvr/setnospeaking";
        /**
         * 查询全局禁言
         */
        public static final String GET_NO_SPEAKING = "v4/openconfigsvr/getnospeaking";
    }

    /**
     * 运营管理
     */
    public static class OperationManage {
        /**
         * 拉取运营数据
         */
        public static final String GET_APP_INFO = "v4/openconfigsvr/getappinfo";
        /**
         * 下载消息记录
         */
        public static final String GET_HISTORY = "v4/open_msg_svc/get_history";
        /**
         * 获取服务器 IP 地址
         */
        public static final String GET_IP_LIST = "v4/ConfigSvc/GetIPList";
    }
}
```

## 工具类

```java
/**
 * 腾讯即时通讯工具类
 *
 * @author guozhenliang
 * @date 2023/03/08 15:20
 **/
@Slf4j
@Component
public class TencentImUtil {
    /**
     * https url前缀
     */
    private static final String HTTPS_URL_PREFIX = "https://console.tim.qq.com/";
    /**
     * app管理员账号
     */
    private static final String APP_MANAGER = "administrator";
    /**
     * 过期时长
     */
    private static final Integer SIGN_EXPIRED = 60 * 60 * 24 * 7;

    @Value("${tencent-im.sdkappid}")
    private long appid;

    @Value("${tencent-im.key}")
    private String secretKey;

    /**
     * 创建管理员用户签名
     *
     * @return {@link String }
     * @author zealerg@126.com
     */
    private String createAdminUserSig() {
        TLSSigAPIv2 sigApi = new TLSSigAPIv2(appid, secretKey);
        return sigApi.genUserSig(APP_MANAGER, SIGN_EXPIRED);
    }

    /**
     * 获取https url
     *
     * @param api    api地址
     * @param random 随机数
     * @return {@link String }
     * @author zealerg@126.com
     */
    private String getHttpsUrl(String api, Integer random) {
        return String.format("%s%s?sdkappid=%s&identifier=%s&usersig=%s&random=%s&contenttype=json", HTTPS_URL_PREFIX, api, appid, APP_MANAGER, this.createAdminUserSig(), random);
    }

    /**
     * 导入单个账号
     *
     * @param userId 用户id
     * @author zealerg@126.com
     */
    public void accountImport(String userId) {
        accountImport(userId, null);
    }

    /**
     * 添加账号
     *
     * @param userId   用户id
     * @param userName 用户昵称
     */
    public void accountImport(String userId, String userName) {
        accountImport(userId, userName, null);
    }

    /**
     * 添加账号
     *
     * @param userId   用户id
     * @param userName 用户昵称
     * @param faceUrl  用户头像 URL
     * @author zealerg@126.com
     */
    public Integer accountImport(String userId, String userName, String faceUrl) {
        Integer random = RandomUtils.nextInt(0, 999999999);
        String httpsUrl = getHttpsUrl(TencentImApiConstant.AccountManage.ACCOUNT_IMPORT, random);
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("Identifier", userId);
        if (StringUtils.isNotEmpty(userName)) {
            jsonObject.put("Nick", userName);
        }
        if (StringUtils.isNotEmpty(faceUrl)) {
            jsonObject.put("FaceUrl", faceUrl);
        }
        log.info("腾讯云im导入单个账号，请求参数：{}", jsonObject);
        String result = HttpRequest.post(httpsUrl)
                .body(jsonObject.toString(), "json")
                .execute().body();
        AccountCommonResult accountCommonResult = JSON.parseObject(result).toJavaObject(AccountCommonResult.class);
        log.info("腾讯云im导入单个账号，返回结果：{}", result);
        return accountCommonResult.getErrorCode();
    }

    /**
     * 查询账号是否已经导入im
     *
     * @param userIds 用户id集合
     * @return {@link String }
     * @author zealerg@126.com
     */
    public String accountCheck(List<String> userIds) {
        Integer random = RandomUtils.nextInt(0, 999999999);
        String httpsUrl = getHttpsUrl(TencentImApiConstant.AccountManage.ACCOUNT_CHECK, random);
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("CheckItem", getUserIdJsonList(userIds));
        log.info("腾讯云im查询账号，请求参数：{}", jsonObject);
        log.info(String.valueOf(jsonObject.getInnerMap()));
        String result = HttpRequest.post(httpsUrl)
                .body(jsonObject.toString(), "json")
                .execute().body();
        log.info("腾讯云im查询账号，返回结果：{}", result);
        return result;
    }

    /**
     * 获取用户id列表json
     *
     * @param userIds 用户id集合
     * @return {@link List }<{@link JSONObject }>
     * @author zealerg@126.com
     */
    private List<JSONObject> getUserIdJsonList(List<String> userIds) {
        return userIds.stream().map(v -> {
            JSONObject userIdJson = new JSONObject();
            userIdJson.put("UserID", v);
            return userIdJson;
        }).collect(Collectors.toList());
    }

    /**
     * 账户导入检查
     *
     * @param phone 电话
     * @return {@link Integer }
     * @author zealerg@126.com
     */
    public Boolean accountCheck(String phone) {
        String jsonResult = accountCheck(new ArrayList<>(Collections.singletonList(phone)));
        JSONArray resultItem = getResultItem(jsonResult);
        AccountCheckResultItem item = resultItem.getJSONObject(0).toJavaObject(AccountCheckResultItem.class);
        log.info("腾讯云im查询账号检查结果项，返回结果：{}", item);
        return item.getAccountStatus().equals(AccountStatusEnum.IMPORTED.getValue());
    }

    /**
     * 得到结果项
     *
     * @param jsonResult json结果
     * @return {@link JSONArray }
     * @author zealerg@126.com
     */
    private JSONArray getResultItem(String jsonResult) {
        JSONObject object = JSON.parseObject(jsonResult);
        return object.getObject("ResultItem", JSONArray.class);
    }

    /**
     * 资料设置
     *
     * @param lifeUser 生活用户
     * @return {@link ImCommonResultDTO }
     * @author zealerg@126.com
     */
    public ImCommonResultDTO profileSet(LifeUser lifeUser) {
        Integer random = RandomUtils.nextInt(0, 999999999);
        String httpsUrl = getHttpsUrl(TencentImApiConstant.PortraitManage.PORTRAIT_SET, random);
        JSONObject jsonObject = new JSONObject();
        JSONArray jsonArray = new JSONArray();
        jsonObject.put("From_Account", lifeUser.getPhone());
        if (StringUtils.isNotBlank(lifeUser.getName())) {
            jsonArray.add(new JSONObject() {
                {
                    put("Tag", ImProfileTagConstant.NAME);
                    put("Value", lifeUser.getName());
                }
            });
        }
        if (StringUtils.isNotBlank(lifeUser.getAvatar())) {
            jsonArray.add(new JSONObject() {
                {
                    put("Tag", ImProfileTagConstant.IMAGE);
                    put("Value", lifeUser.getAvatar());
                }
            });
        }
        jsonObject.put("ProfileItem", jsonArray);
        log.info("腾讯云im设置账号资料，请求参数：{}", jsonObject);
        String result = HttpRequest.post(httpsUrl)
                .body(jsonObject.toString(), "json")
                .execute().body();
        log.info("腾讯云im设置账号资料，返回结果：{}", result);
        return JSON.parseObject(result).toJavaObject(ImCommonResultDTO.class);
    }
}
```

## 实体类

### 消息请求包DTO

用于发送单聊之前回调接收app发出的消息请求

```java
/**
 * 消息请求包DTO
 *
 * @author zealerg
 * @date 2023/03/12 13:12
 **/
@Data
public class ImMsgRequestDTO implements Serializable {
    /**
     * 回调命令
     */
    private String CallbackCommand;
    /**
     * 发送者
     */
    private String From_Account;
    /**
     * 接收者
     */
    private String To_Account;
    /**
     * 消息序列号
     */
    private Long MsgSeq;
    /**
     * 消息随机数
     */
    private Long MsgRandom;
    /**
     * 消息的发送时间戳，单位为秒
     */
    private Long MsgTime;
    /**
     * 消息的唯一标识，可用于 REST API 撤回单聊消息
     */
    private String MsgKey;
    /**
     * 在线消息，为1，否则为0；
     */
    private Integer OnlineOnlyFlag;
    /**
     * 消息体
     */
    private List<MsgBodyRequestDTO> MsgBody;
    /**
     * 云自定义数据
     */
    private String CloudCustomData;

}
```

### 消息体请求DTO

```java
/**
 * 消息体请求dto
 *
 * @author zealerg
 * @date 2023/03/12 13:21
 **/
@Data
public class MsgBodyRequestDTO implements Serializable {
    /**
     * 消息类型
     */
    private String MsgType;
    /**
     * 消息内容
     */
    private MsgContentRequestDTO MsgContent;
}
```

### 消息内容请求DTO

```java
/**
 * 消息内容请求dto
 *
 * @author zealerg
 * @date 2023/03/12 13:22
 **/
@Data
public class MsgContentRequestDTO implements Serializable {
    /**
     * 文本
     */
    private String Text;
    /**
     * 图片的唯一标识，客户端用于索引图片的键值
     */
    private String UUID;
    /**
     * 图片格式。JPG = 1，GIF = 2，PNG = 3，BMP = 4，其他 = 255。
     */
    private Integer ImageFormat;
    /**
     * 原图、缩略图或者大图下载信息
     */
    private List<ImageInfoArrayRequestDTO> ImageInfoArray;
}
```

### 账户校验结果项

```java
/**
 * 账户校验结果项
 *
 * @author zealerg
 * @date 2023/03/08 19:45
 **/
@Data
public class AccountCheckResultItem {
    /**
     * 用户id
     */
    private String UserID;
    /**
     * 结果代码
     */
    private String ResultCode;
    /**
     * 结果信息
     */
    private String ResultInfo;
    /**
     * 账户状态
     */
    private String AccountStatus;
}
```

### 通用结果项

```java
/**
 * 通用结果项
 *
 * @author guozhenliang
 * @description
 * @date 2023/03/10 15:04
 **/
@Data
public class AccountCommonResult {
    /**
     * 动作状态
     */
    private String ActionStatus;
    /**
     * 错误信息
     */
    private String ErrorInfo;
    /**
     * 错误代码
     */
    private Integer ErrorCode;
}
```

## 实际用法

### [**生成 UserSig**](https://cloud.tencent.com/document/product/269/32688)

入参不一定要是电话，只要是用户标识就行

```java
/**
     * 生成userSig
     *
     * @param phone 电话
     * @return {@link String }
     * @author zealerg@126.com
     */
    public String generateUserSig(String phone) {
        TLSSigAPIv2 api = new TLSSigAPIv2(imSdkAppId, imSecretKey);
        return api.genUserSig(phone, ContentTypeConstant.IM_EXPIRE);
    }
```

### 注册

注册就是[导入账号](https://cloud.tencent.com/document/product/269/1608)，入参UserID必填，昵称和头像选填

```java
/**
     * 注册即时通讯
     *
     * @param phone 电话
     * @return {@link Integer }
     * @author zealerg@126.com
     */
    @Override
    public Integer imSignUp(String phone) {
        LifeUser lifeUser = lifeUserService.getUserByUserPhone(phone);
        return tencentImUtil.accountImport(phone, lifeUser.getName(), StringUtils.isBlank(lifeUser.getAvatar()) ? defaultAvatar : lifeUser.getAvatar());
    }
```

### [查询账号](https://cloud.tencent.com/document/product/269/38417)

入参UserID

```java
    /**
     * 账户导入检查
     *
     * @param phone 电话
     * @return {@link Integer }
     * @author zealerg@126.com
     */
    public Boolean accountCheck(String phone) {
        String jsonResult = accountCheck(new ArrayList<>(Collections.singletonList(phone)));
        JSONArray resultItem = getResultItem(jsonResult);
        AccountCheckResultItem item = resultItem.getJSONObject(0).toJavaObject(AccountCheckResultItem.class);
        log.info("腾讯云im查询账号检查结果项，返回结果：{}", item);
        return item.getAccountStatus().equals(AccountStatusEnum.IMPORTED.getValue());
    }
```

### [资料设置](https://cloud.tencent.com/document/product/269/1640)

```java
/**
 * 资料设置
 *
 * @param lifeUser 生活用户
 * @return {@link ImCommonResultDTO }
 * @author zealerg@126.com
 */
public ImCommonResultDTO profileSet(LifeUser lifeUser) {
    Integer random = RandomUtils.nextInt(0, 999999999);
    String httpsUrl = getHttpsUrl(TencentImApiConstant.PortraitManage.PORTRAIT_SET, random);
    JSONObject jsonObject = new JSONObject();
    JSONArray jsonArray = new JSONArray();
    jsonObject.put("From_Account", lifeUser.getPhone());
    if (StringUtils.isNotBlank(lifeUser.getName())) {
        jsonArray.add(new JSONObject() {
            {
                put("Tag", ImProfileTagConstant.NAME);
                put("Value", lifeUser.getName());
            }
        });
    }
    if (StringUtils.isNotBlank(lifeUser.getAvatar())) {
        jsonArray.add(new JSONObject() {
            {
                put("Tag", ImProfileTagConstant.IMAGE);
                put("Value", lifeUser.getAvatar());
            }
        });
    }
    jsonObject.put("ProfileItem", jsonArray);
    log.info("腾讯云im设置账号资料，请求参数：{}", jsonObject);
    String result = HttpRequest.post(httpsUrl)
            .body(jsonObject.toString(), "json")
            .execute().body();
    log.info("腾讯云im设置账号资料，返回结果：{}", result);
    return JSON.parseObject(result).toJavaObject(ImCommonResultDTO.class);
}
```

### im第三方回调

回调的话需要在控制台配置一个回调URL以及要回调的一些配置

![[Untitled 31.png]]

![[Untitled 32.png]]

在上图这个地方勾选你所需的回调并且在下方代码这个地方判断其回调命令，根据这个回调命令来进行逻辑处理再把应答包发还给腾讯云IM让其进行消息的发放或是禁止等等，这边也可以做一个sdkappid的匹配

```java
/**
     * im回调
     *
     * @param msgRequest 消息请求
     * @param sdkAppid   sdk appid
     * @return {@link ImCommonResultDTO }
     * @author zealerg@126.com
     */
    public ImCommonResultDTO callback(ImMsgRequestDTO msgRequest, String sdkAppid) {
        ImCommonResultDTO result = new ImCommonResultDTO();
        result.setActionStatus("OK");
        result.setErrorCode(0);
        result.setErrorInfo("");
        log.info("消息来自:{},与本机sdk-{}匹配结果:{}", sdkAppid, imSdkAppId, sdkAppid.equals(Long.toString(imSdkAppId)));
        log.info("消息请求体:{}", msgRequest);
        //发单聊消息之前回调处理逻辑
        if (msgRequest.getCallbackCommand().equals(ImCallbackCommandConstant.SingleChat.BEFORE_SEND_MSG)) {
            
        }
        return result;
    }
```

# 踩坑点

## 第三方回调

回调这边发还给腾讯云IM的应答包需要符合格式，如果不符合格式的话会调用不到回调

![[Untitled 33.png]]

## 消息序列号类型

消息序列号类型应该是Long而不是Integer，被误导了

![[Untitled 34.png]]

![[Untitled 35.png]]

回调那边接收MsgSeq的数据类型我写成了Integer导致了溢出报错，所以上方实体类<u>消息请求包DTO</u>中的**消息序列号**要使用**Long**类型

# 参考

[https://blog.csdn.net/qq_40406380/article/details/117926702](https://blog.csdn.net/qq_40406380/article/details/117926702)

[https://blog.csdn.net/wode3157695297/article/details/121063003](https://blog.csdn.net/wode3157695297/article/details/121063003)