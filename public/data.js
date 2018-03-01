// insert activity state
let overlap = function overlap(userlist, type) {
    if (type === 'all') {
        let len = userlist.length;
        for (let i = 0; i < len; i++) {
            userlist[i]['activity'] = {
                'A': true,
                'B': true,
            };
        }
    } else {
        if (type === 'like') {
            type = 1;
        }
        if (type === 'love') {
            type = 2;
        }
        if (type === 'haha') {
            type = 3;
        }
        if (type === 'wow') {
            type = 4;
        }
        if (type === 'sad') {
            type = 5;
        }
        if (type === 'angry') {
            type = 6;
        }
        if (type === 'other') {
            type = 7;
        }
        let len = userlist.length;
        for (let i = 0; i < len; i++) {
            let pal = userlist[i].posts.A.length;
            for (let j = 0; j < pal; j++) {
                if (type === 'comment') {
                    if (userlist[i].posts.A[j].commentcount != 0) {
                        userlist[i]['activity'] = {
                            'A': true,
                            'B': false,
                        };
                        j = pal;
                    }
                } else if (type === 'share') {
                    if (userlist[i].posts.A[j].share === true) {
                        userlist[i]['activity'] = {
                            'A': true,
                            'B': false,
                        };
                        j = pal;
                    }
                } else {
                    if (userlist[i].posts.A[j].like === type) {
                        userlist[i]['activity'] = {
                            'A': true,
                            'B': false,
                        };
                        j = pal;
                    }
                }
            }
            let pbl = userlist[i].posts.B.length;
            for (let j = 0; j < pbl; j++) {
                if (userlist[i].activity) {
                    if (type === 'comment') {
                        if (userlist[i].posts.B[j].commentcount != 0) {
                            userlist[i]['activity'].B = true;
                            j = pbl;
                        }
                    } else if (type === 'share') {
                        if (userlist[i].posts.A[j].share === true) {
                            userlist[i]['activity'].B = true;
                            j = pbl;
                        }
                    } else {
                        if (userlist[i].posts.B[j].like === type) {
                            userlist[i]['activity'].B = true;
                            j = pbl;
                        }
                    }
                } else {
                    if (type === 'comment') {
                        if (userlist[i].posts.B[j].commentcount != 0) {
                            userlist[i]['activity'] = {
                                'A': false,
                                'B': true,
                            };
                            j = pbl;
                        }
                    } else if (type === 'share') {
                        if (userlist[i].posts.B[j].share === true) {
                            userlist[i]['activity'] = {
                                'A': false,
                                'B': true,
                            };
                            j = pbl;
                        }
                    } else {
                        if (userlist[i].posts.B[j].like === type) {
                            userlist[i]['activity'] = {
                                'A': false,
                                'B': true,
                            };
                            j = pbl;
                        }
                    }
                }
            }
        }
    }
    console.log('ol length: ' + len);
    return userlist;
};

/**
 * get BaseLog
 * @param {number} x -
 * @param {number} y -
 * @return {number}
 */
function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
  }