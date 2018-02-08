# PageVis
linux / windows diffenences
public/nav.js
views/partials/page/nav.hbs
shared/templates/error.hbs

autocheck bellow:
app.js
config.js
controllers/text.js
server/serverUtilities.js

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
                            like_count
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

