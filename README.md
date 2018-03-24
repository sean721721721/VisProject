# PageVis
## linux / windows diffenences
### manual setting
* public/nav.js
* views/partials/page/nav.hbs
* shared/templates/error.hbs

### code autocheck bellow:
* app.js
* config.js
* controllers/text.js
* server/serverUtilities.js

## database
### db1 facebook pages
```
data
    pagedata
        id
        created_time
        type
        message
        from
            name
            id
        shares
        likes
        reactions
            like
            love
            haha
            wow
            angry
            sad
            thankful
        comments
            context
                from
                likes
                message
                comments
                comment_count
                created_time
                id
            summary
        attachments
            description
            url
            title
            type
        word
            word
            weight
    userdata
        A / B / O
            name
            id
            posts
                A / B
                    clist
                        comment_count
                        comments
                            created_time
                            from
                                name
                                id
                            id
                            like_coun
                            message
                        created_time
                        from
                            name
                            id
                        id
                        like_count
                        message
                    commentcount
                    id
                    like
                    share
                    word
                        word
                        weight
query
    co
    mincomment
    minlike
    page1
    page2
    time1
    time2
    time3
    time4
summary
    p1_post_count, p2_post_count, post_count
    p1_user_count, p2_user_count, user_count
```
### db2 ptt boards
```
{
    "article_id": 文章 ID,
    "article_title": 文章標題 ,
    "author": 作者,
    "board": 板名,
    "content": 文章內容,
    "date": 發文時間,
    "ip": 發文位址,
    "message_count": { # 推文
        "all": 總數,
        "boo": 噓文數,
        "count": 推文數-噓文數,
        "neutral": → 數,
        "push": 推文數
    },
    "messages": [ # 推文內容
      {
        "push_content": 推文內容,
        "push_ipdatetime": 推文時間及位址,
        "push_tag": 推/噓/→ ,
        "push_userid": 推文者 ID
      },
      ...
      ]
}
```