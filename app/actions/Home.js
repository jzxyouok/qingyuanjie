/**
 *
 * @author keyy/1501718947@qq.com 16/11/29 10:16
 * @description
 */
import * as ActionTypes from './ActionTypes'
import {postFetch, getFetch, putFetch, deleteFetch} from '../utils/NetUtil'
import {toastShort} from '../utils/ToastUtil'
import {URL_DEV} from '../constants/Constant'
import {DeviceEventEmitter} from 'react-native'
import tmpGlobal from '../utils/TmpVairables'

export function getPostList(data, resolve, reject) {
  return (dispatch)=> {
    getFetch('/post/getpostlist/', `${data.pageIndex}/${data.pageSize}/${data.Lat}/${data.Lng}?postType=${data.postType}`, dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END, data}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function getPostListQuiet(data, resolve, reject) {
  return (dispatch)=> {
    getFetch('/post/getpostlist/', `${data.pageIndex}/${data.pageSize}/${data.Lat}/${data.Lng}?postType=${data.postType}`, dispatch, {
      type: ActionTypes.FETCH_BEGIN_QUIET,
      data
    }, {type: ActionTypes.FETCH_END_QUIET, data}, {type: ActionTypes.FETCH_FAILED_QUIET}, resolve, reject);
  }
}

export function like(data, resolve, reject) {
  return (dispatch)=> {
    putFetch(`/post/like/${data.postId}/${data.isLike}`, data, dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function comment(data, resolve, reject) {
  return (dispatch)=> {
    postFetch(`/post/comment/${data.postId}?forCommentId=${data.forCommentId}`, {comment: data.comment}, dispatch, {type: ActionTypes.FETCH_BEGIN}, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function deleteAnnouncement(data, resolve, reject) {
  return (dispatch)=> {
    deleteFetch(`/post/delete/${data.PostId}`, '', dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function getAnnouncementDetail(data, resolve, reject) {
  return (dispatch)=> {
    getFetch('/post/viewpost/', `${data.postId}/${data.Lat}/${data.Lng}`, dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function getAnnouncementDetailQuiet(data, resolve, reject) {
  return (dispatch)=> {
    getFetch('/post/viewpost/', `${data.postId}/${data.Lat}/${data.Lng}`, dispatch, {
      type: ActionTypes.FETCH_BEGIN_QUIET,
      data
    }, {type: ActionTypes.FETCH_END_QUIET}, {type: ActionTypes.FETCH_FAILED_QUIET}, resolve, reject);
  }
}

export function getCommentList(data, resolve, reject) {
  return (dispatch)=> {
    getFetch('/post/getpostcommentlist/', `${data.postId}/${data.pageIndex}/${data.pageSize}/${data.Lat}/${data.Lng}`, dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function getCommentListQuiet(data, resolve, reject) {
  return (dispatch)=> {
    getFetch('/post/getpostcommentlist/', `${data.postId}/${data.pageIndex}/${data.pageSize}/${data.Lat}/${data.Lng}`, dispatch, {
      type: ActionTypes.FETCH_BEGIN_QUIET,
      data
    }, {type: ActionTypes.FETCH_END_QUIET}, {type: ActionTypes.FETCH_FAILED_QUIET}, resolve, reject);
  }
}

export function getUserInfo(data, resolve, reject) {
  return (dispatch)=> {
    getFetch('/profiles/', `${data.UserId}?lat=${data.Lat}&lng=${data.Lng}`, dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function getUserPhotos(data, resolve, reject) {
  return (dispatch)=> {
    getFetch('/users/', `${data.UserId}/photos`, dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function gore(data, resolve, reject) {
  return (dispatch)=> {
    putFetch(`/post/up/${data.PostId}`, data, dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function getCurrentUserProfile(data, resolve, reject) {
  return (dispatch)=> {
    getFetch('/profile', data, dispatch, {type: ActionTypes.FETCH_BEGIN}, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function newPost(data, resolve, reject) {
  return (dispatch)=> {
    getFetch(`/post/doihaveanotexpiredpost?postType=${data.postType}`, '', dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END, data}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

function fetchOptions(data) {
  return {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }
}

function pushNewPost(dispatch, data, imgArr, navigator, callback) {
  let params = {
    PostContent: data.PostContent,
    ...tmpGlobal.currentLocation,
    PicList: imgArr,
    PartyPayType: data.PartyPayType,
    PartyPeopleNumber: data.PartyPeopleNumber,
    PostType: data.postType
  };
  dispatch({type: ActionTypes.FETCH_BEGIN, params});
  fetch(URL_DEV + '/post/newpost/' + data.days, fetchOptions(params))
    .then(response=>response.json())
    .then((json)=> {
      dispatch({type: ActionTypes.FETCH_END, params, json});
      if ('OK' != json.Code) {
        toastShort(json.Message);
        return false;
      } else {
        callback(data.postType - 1);
      }
    }).catch((error)=> {
    dispatch({type: ActionTypes.FETCH_FAILED, params, error});
    toastShort('网络异常,请重试');
  })
}

export function postAnnouncement(data, navigator, callback) {
  return (dispatch)=> {
    const photoCount = data.imageArr.length;
    let uploadReq = 0;
    let uploadImgArr = [];
    if (photoCount !== 0) {
      dispatch({type: ActionTypes.UPLOAD_PHOTO_BEGIN});
      for (let i = 0; i < data.imageArr.length; i++) {
        uploadSingleImage(data.imageArr[i], data, dispatch, callback);
      }
    } else {
      pushNewPost(dispatch, data, [], navigator, callback);
    }

    function uploadSingleImage(obj, data, dispatch, callback) {
      let formData = new FormData();
      let file = {
        uri: obj.uri,
        type: 'multipart/form-data',
        name: obj.id + '.jpg'
      };
      formData.append("file", file);
      fetch(URL_DEV + '/uploadphoto', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData
      }).then((response) => response.json())
        .then((json)=> {
          //dispatch(uploadEnd(arr,json));
          if ('OK' !== json.Code) {
            toastShort(json.Message);
            //dispatch(uploadFailed(arr,json));
            return false;
          } else {
            uploadImgArr.push(json.Result);
            uploadReq += 1;
            if (uploadReq === photoCount) {
              dispatch({type: ActionTypes.UPLOAD_PHOTO_END, data, json});
              pushNewPost(dispatch, data, uploadImgArr, navigator, callback);
            }
          }
        })
        .catch((error)=> {
          //dispatch(uploadFailed(arr,error));
          toastShort('网络发生错误,请重试');
        });
    }
  }
}

export function getAllAnnouncement(data, resolve, reject) {
  return (dispatch)=> {
    getFetch(`/post/getuserpostlist/${data.targetUserId}/${data.pageIndex}/${data.pageSize}/${data.Lat}/${data.Lng}/?postOrderTyp=${data.postOrderTyp}`, '', dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function getAllAnnouncementQuiet(data, resolve, reject) {
  return (dispatch)=> {
    getFetch(`/post/getuserpostlist/${data.targetUserId}/${data.pageIndex}/${data.pageSize}/${data.Lat}/${data.Lng}/?postOrderTyp=${data.postOrderTyp}`, '', dispatch, {
      type: ActionTypes.FETCH_BEGIN_QUIET,
      data
    }, {type: ActionTypes.FETCH_END_QUIET}, {type: ActionTypes.FETCH_FAILED_QUIET}, resolve, reject);
  }
}

export function attention(data, resolve, reject) {
  return (dispatch)=> {
    postFetch(`/follower/follower/${data.attentionUserId}`, data, dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function getDatingFilter(data, resolve, reject) {
  return (dispatch)=> {
    getFetch('/profile/filter', data, dispatch, {type: ActionTypes.FETCH_BEGIN}, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function getMatchUsers(data, resolve, reject) {
  return (dispatch)=> {
    postFetch('/profile/getmatchlist', data, dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function getRandomUsers(data, resolve, reject) {
  return (dispatch)=> {
    getFetch(`/profile/getrandomuser?pagesize=${data.pageSize}`, '', dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function getRandomUsersQuiet(data, resolve, reject) {
  return (dispatch)=> {
    getFetch(`/profile/getrandomuser?pagesize=${data.pageSize}`, '', dispatch, {
      type: ActionTypes.FETCH_BEGIN_QUIET,
      data
    }, {type: ActionTypes.FETCH_END_QUIET}, {type: ActionTypes.FETCH_FAILED_QUIET}, resolve, reject);
  }
}

export function canSayHey(data, resolve, reject) {
  return (dispatch)=> {
    getFetch(`/profile/cansayhey/${data.UserId}`, '', dispatch, {
      type: ActionTypes.FETCH_BEGIN_QUIET,
      data
    }, {type: ActionTypes.FETCH_END_QUIET}, {type: ActionTypes.FETCH_FAILED_QUIET}, resolve, reject);
  }
}

export function getMatchUsersQuiet(data, resolve, reject) {
  return (dispatch)=> {
    postFetch('/profile/getmatchlist', data, dispatch, {
      type: ActionTypes.FETCH_BEGIN_QUIET,
      data
    }, {type: ActionTypes.FETCH_END_QUIET}, {type: ActionTypes.FETCH_FAILED_QUIET}, resolve, reject);
  }
}

export function setMapPrecisionQuiet(data, resolve, reject) {
  return (dispatch)=> {
    putFetch(`/profiles/setmapprecision?mapPrecision=${data.MapPrecision}`, data, dispatch, {
      type: ActionTypes.FETCH_BEGIN_QUIET,
      data
    }, {type: ActionTypes.FETCH_END_QUIET}, {type: ActionTypes.FETCH_FAILED_QUIET}, resolve, reject);
  }
}

export function setFloatMsg(data, resolve, reject) {
  return (dispatch)=> {
    postFetch(`/msg/sendfloatermsg?msg=${data.Msg}`, data, dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function report(data, resolve, reject) {
  return (dispatch)=> {
    postFetch('/report', data, dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function isInBlackList(data, resolve, reject) {
  return (dispatch)=> {
    getFetch(`/blacklist/isinblacklist/${data.blackUserId}`, '', dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function putToBlackList(data, resolve, reject) {
  return (dispatch)=> {
    putFetch(`/blacklist/changestatus/${data.ForUserId}`, '', dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function getTransRecord(data, resolve, reject) {
  return (dispatch)=> {
    getFetch(`/profile/traderecord?pageIndex=${data.pageIndex}&pageSize=${data.pageSize}`, '', dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function getTransRecordQuiet(data, resolve, reject) {
  return (dispatch)=> {
    getFetch(`/profile/traderecord?pageIndex=${data.pageIndex}&pageSize=${data.pageSize}`, '', dispatch, {
      type: ActionTypes.FETCH_BEGIN_QUIET,
      data
    }, {type: ActionTypes.FETCH_END_QUIET}, {type: ActionTypes.FETCH_FAILED_QUIET}, resolve, reject);
  }
}

export function pushSwitch(data, resolve, reject) {
  return (dispatch)=> {
    putFetch('/profile/turnonpush/', '', dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function sendSms(data, resolve, reject) {
  return (dispatch)=> {
    postFetch(`/profile/${data.UserId}/sms`, data, dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}

export function getSettings(data, resolve, reject) {
  return (dispatch)=> {
    postFetch('/profile/setting', data, dispatch, {
      type: ActionTypes.FETCH_BEGIN,
      data
    }, {type: ActionTypes.FETCH_END}, {type: ActionTypes.FETCH_FAILED}, resolve, reject);
  }
}
