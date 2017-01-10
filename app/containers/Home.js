/**
 *
 * @author keyy/1501718947@qq.com 16/11/10 09:54
 * @description
 */
import React, {Component} from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  InteractionManager,
  ListView,
  RefreshControl,
  Image,
  TouchableOpacity,
  Dimensions,
  DeviceEventEmitter,
  Platform,
  Keyboard,
  Animated,
  TouchableHighlight,
  Alert
} from 'react-native'
import BaseComponent from '../base/BaseComponent'
import {Button as NBButton} from 'native-base'
import Icon from 'react-native-vector-icons/FontAwesome'
import IonIcon from 'react-native-vector-icons/Ionicons'
import {connect} from 'react-redux'
import * as HomeActions from '../actions/Home'
import Spinner from '../components/Spinner'
import LoadMoreFooter from '../components/LoadMoreFooter'
import AnnouncementDetail from '../pages/AnnouncementDetail'
import Addannouncement from '../pages/Addannouncement'
import UserInfo from '../pages/UserInfo'
import {URL_DEV, TIME_OUT} from '../constants/Constant'
import tmpGlobal from '../utils/TmpVairables'
import {toastShort} from '../utils/ToastUtil'
import PhotoScaleViewer from '../components/PhotoScaleViewer'
import ModalBox from 'react-native-modalbox'
import SubTabView from '../components/SubTabView'
import ActionSheet from 'react-native-actionsheet'
import AnnouncementList from '../pages/AnnouncemenetList'

const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E2E2'
  },
  listView: {
    flex: 1
  },
  contentTitle: {
    margin: 10
  },
  content: {
    flex: 1
  },
  card: {
    backgroundColor: '#FFF',
    flex: 1,
    marginTop: 10,
    marginHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 4
  },
  cardRow: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 10
  },
  avatarImg: {
    width: width / 9,
    height: width / 9,
    marginRight: 10,
    borderRadius: 8
  },
  userInfo: {
    justifyContent: 'space-between',
    flex: 1
  },
  userInfoLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  userInfoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'pink',
    borderWidth: 1,
    borderColor: 'pink',
    paddingHorizontal: 6
  },
  userInfoIcon: {
    marginRight: 4,
    color: '#FFF'
  },
  userInfoText: {
    fontSize: 10,
    color: '#FFF'
  },
  nameTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nameText: {
    overflow: 'hidden',
    flex: 1,
    flexWrap: 'nowrap'
  },
  timeText: {
    fontSize: 12,
    justifyContent: 'center'
  },
  moodView: {
    marginTop: 10
  },
  moodText: {
    fontSize: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    marginBottom: 10
  },
  postImage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    //paddingVertical: 5,
    justifyContent: 'flex-start',
    paddingLeft: 10
  },
  cardBtn: {
    marginTop: 10,
    marginRight: 20
  },
  moreImgLabel: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    paddingHorizontal: 2
  },
  moreImgIcon: {},
  moreImgText: {
    fontSize: 10,
    marginLeft: 4
  },
  singleImgContainer: {
    marginBottom: 10,
    marginRight: 10
  }
});

let navigator;
let commentId;
let lastCount, lastAppoinmentCount;

const buttons = ['取消', '发聚会', '发约会'];
const CANCEL_INDEX = 0;
const DESTRUCTIVE_INDEX = 0;

class Home extends BaseComponent {

  constructor(props) {
    super(props);
    navigator = this.props.navigator;
    this.state = {
      tabIndex: 0,
      refreshing: false,
      appointmentRefreshing: false,
      loadingMore: false,
      appointmentLoadingMore: false,
      pageSize: 10,
      pageIndex: 1,
      appointmentPageSize: 10,
      appointmentPageIndex: 1,
      postList: [],//聚会列表
      appointmentList: [],//约会列表
      comment: '',
      appointmentComment: '',
      viewMarginBottom: new Animated.Value(0),
      appointmentViewMarginBottom: new Animated.Value(0),
      showCommentInput: false,
      avatarLoading: true,
      appointmentAvatarLoading: true,
      imgLoading: true,
      appointmentImgLoading: true,
      showIndex: 0,
      appointmentShowIndex: 0,
      imgList: [],
      appointmentImgList: [],
      commentInputHeight: 0,
      appointmentCommentInputHeight: 0,
    };

    this._handleInputHeight = this._handleInputHeight.bind(this);
  }

  componentWillMount() {
    InteractionManager.runAfterInteractions(()=> {
      this._getAnnouncementList();
    });
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }

  _getAnnouncementList() {
    const {dispatch}=this.props;
    let data = {
      pageSize: this.state.pageSize,
      pageIndex: this.state.pageIndex,
      ...tmpGlobal.currentLocation,
      postType: 1
    };
    dispatch(HomeActions.getPostList(data, (json)=> {
      lastCount = json.Result.length;
      this.setState({
        postList: json.Result
      });

      let params = {
        pageSize: this.state.appointmentPageSize,
        pageIndex: this.state.appointmentPageIndex,
        ...tmpGlobal.currentLocation,
        postType: 2
      };
      //获取约会列表
      dispatch(HomeActions.getPostList(params, (json2)=> {
        lastAppoinmentCount = json2.Result.length;
        this.setState({
          appointmentList: json2.Result
        });
      }, (error2)=> {

      }));
    }, (error)=> {

    }));
  }

  _toEnd() {
    //如果最后一次请求的数据数量少于每页需要渲染的数量,表明没有更多数据了(在没有更多数据的情况下,暂时不能继续上拉加载更多数据。在实际场景中,这里是可以一直上拉加载更多数据的,便于有即时新数据拉取)
    if (lastCount < this.state.pageSize || this.state.postList.length < this.state.pageSize) {
      return false;
    }
    InteractionManager.runAfterInteractions(() => {
      console.log("触发加载更多 toEnd() --> ");
      this._loadMoreData();
    });
  }

  _loadMoreData() {
    console.log('加载更多');
    this.setState({loadingMore: true});
    const {dispatch} = this.props;
    this.state.pageIndex += 1;
    const data = {
      pageSize: this.state.pageSize,
      pageIndex: this.state.pageIndex,
      ...tmpGlobal.currentLocation
    };
    dispatch(HomeActions.getPostList(data, (json)=> {
      lastCount = json.Result.length;
      this.state.postList = this.state.postList.concat(json.Result);
      this.setState({
        ...this.state.postList,
        refreshing: false,
        loadingMore: false
      })
    }, (error)=> {

    }));
  }

  _onRefresh() {
    const {dispatch}=this.props;
    if (this.state.tabIndex === 0) {
      this.setState({
        refreshing: true,
        pageIndex: 1
      });
    } else {
      this.setState({
        appointmentRefreshing: true,
        appointmentPageIndex: 1
      });
    }

    const data = {
      pageSize: this.state.tabIndex === 0 ? this.state.pageSize : this.state.appointmentPageSize,
      pageIndex: 1,
      ...tmpGlobal.currentLocation,
      postType: this.state.tabIndex + 1
    };
    dispatch(HomeActions.getPostListQuiet(data, (json)=> {
      if (this.state.tabIndex === 0) {
        lastCount = json.Result.length;
        this.setState({
          postList: json.Result,
          refreshing: false
        });
      } else {
        lastCount = json.Result.length;
        this.setState({
          appointmentList: json.Result,
          appointmentRefreshing: false
        });
      }
    }, (error)=> {
      if (this.state.tabIndex === 0) {
        this.setState({
          refreshing: false
        });
      } else {
        this.setState({
          appointmentRefreshing: false
        });
      }
    }));
  }

  _renderFooter() {
    if (this.state.loadingMore) {
      //这里会显示正在加载更多,但在屏幕下方,需要向上滑动显示(自动或手动),加载指示器,阻止了用户的滑动操作,后期可以让页面自动上滑,显示出这个组件。
      return <LoadMoreFooter />
    }

    if (lastCount < this.state.pageSize) {
      return (<LoadMoreFooter isLoadAll={true}/>);
    }

    if (!lastCount) {
      return null;
    }
  }

  componentDidMount() {
    this.hasReadListener = DeviceEventEmitter.addListener('announcementHasRead', ()=> {
      this._onRefresh()
    });
    this.hasDeleteListener = DeviceEventEmitter.addListener('announcementHasDelete', ()=> {
      this._onRefresh()
    });
    this.publishListener = DeviceEventEmitter.addListener('announcementHasPublish', ()=> {
      this._onRefresh()
    });
    this.commentListener = DeviceEventEmitter.addListener('announcementHasComment', ()=> {
      this._onRefresh()
    });
  }

  componentWillUnmount() {
    this.hasReadListener.remove();
    this.hasDeleteListener.remove();
    this.publishListener.remove();
    this.commentListener.remove();
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  //因为在MainContainer中在ScrollableTabView外层包裹了一个View,所以这里的keyboardWillShow、keyboardWillHide失效,只能用keyboardDidShow及keyboardDidHide监听键盘事件
  //https://github.com/skv-headless/react-native-scrollable-tab-view/issues/500
  //ScrollableTabView并不强制要求作为根节点使用。(如果作为根节点使用,在安卓设备上,弹出键盘时,底部tabBar会跟随上滑)
  _keyboardDidShow(e) {
    Animated.timing(
      this.state.viewMarginBottom,
      {
        toValue: e.endCoordinates.height - (Platform.OS === 'ios' ? 45.5 : 50),
        duration: 10,
      }
    ).start();
  }

  _keyboardDidHide() {
    this._resetScrollTo();
  }

  getNavigationBarProps() {
    return {
      title: '广场',
      hideRightButton: false,
      rightIcon: {
        name: 'plus'
      },
      leftIcon: {
        name: 'bars',
        size: 26
      }
    };
  }

  onLeftPressed() {
    this.props.menuChange(true);
  }

  onRightPressed() {
    this._closeCommentInput();
    this.ActionSheet.show();
  }

  //点击actionSheet
  _actionSheetPress(index) {
    if (index === 2) {
      this._canPost(2);
    } else if (index === 1) {
      this._canPost(1);
    }
  }

  //检查是否有未过期的聚会/约会
  _canPost(int) {
    const {dispatch, navigator}=this.props;
    let data = {
      postType: int
    };
    dispatch(HomeActions.newPost(data, (json)=> {
      if (json.Result.CanPost) {
        navigator.push({
          component: Addannouncement,
          name: 'Addannouncement',
          params: {
            title: int === 1 ? '发布新聚会' : '发布新约会',
            postType: int
          }
        });
      } else {
        this._newPostAlert(int);
      }
    }, (error)=> {
    }));
  }

  //前往我的历史公告列表(包含聚会和约会)
  _goAnnouncementList() {
    navigator.push({
      component: AnnouncementList,
      name: 'AnnouncementList',
      params: {
        targetUserId: tmpGlobal.currentUser.UserId,
        Nickname: tmpGlobal.currentUser.Nickname
      }
    });
  }

  _newPostAlert(int) {
    Alert.alert('提示', '可发布的未过期的动态数量已达上限', [
      {
        text: `查看历史${int === 1 ? '聚会' : '约会'}`, onPress: () => {
        this._goAnnouncementList();
      }
      },
      {
        text: '关闭', onPress: () => {
      }
      }
    ]);
  }

  //点击头像和名字,跳转个人信息详情页
  _goUserInfo(data) {
    this._closeCommentInput();
    const {dispatch}=this.props;
    let params = {
      UserId: data.UserId,
      ...tmpGlobal.currentLocation
    };
    dispatch(HomeActions.getUserInfo(params, (json)=> {
      dispatch(HomeActions.getUserPhotos({UserId: data.UserId}, (result)=> {
        navigator.push({
          component: UserInfo,
          name: 'UserInfo',
          params: {
            Nickname: data.Nickname,
            UserId: data.UserId,
            myUserId: tmpGlobal.currentUser.UserId,
            ...json.Result,
            userPhotos: result.Result,
            myLocation: tmpGlobal.currentLocation,
            isSelf: tmpGlobal.currentUser.UserId === data.UserId,
          }
        });
      }, (error)=> {
      }));
    }, (error)=> {
    }));
  }

  //点赞/取消赞(不论是否已赞,点赞取消赞,isLike都传true,isLike可能的值null,true,false)
  _doLike(id, isLike) {
    this._closeCommentInput();
    const {dispatch}=this.props;
    let index = this.state.postList.findIndex((item)=> {
      return item.Id === id;
    });

    let appointmentIndex = this.state.appointmentList.findIndex((item)=> {
      return item.Id === id;
    });
    if (this.state.tabIndex === 0) {
      if (isLike === null) {
        this.state.postList[index].LikeCount += 1;
        this.state.postList[index].AmILikeIt = true;
      } else {
        this.state.postList[index].LikeCount -= 1;
        this.state.postList[index].AmILikeIt = null;
      }
    } else {
      if (isLike === null) {
        this.state.appointmentList[appointmentIndex].LikeCount += 1;
        this.state.appointmentList[appointmentIndex].AmILikeIt = true;
      } else {
        this.state.appointmentList[appointmentIndex].LikeCount -= 1;
        this.state.appointmentList[appointmentIndex].AmILikeIt = null;
      }
    }

    const data = {
      postId: id,
      isLike: true
    };
    dispatch(HomeActions.like(data, (json)=> {
      if (this.state.tabIndex === 0) {
        this.setState({
          postList: [
            ...this.state.postList
          ]
        });
      } else {
        this.setState({
          appointmentList: [
            ...this.state.appointmentList
          ]
        });
      }

    }, (error)=> {
    }));
  }

  _showCommentInput(id) {
    //保存当前要评论的广告id
    commentId = id;
    this.setState({
      showCommentInput: true
    });
  }

  _closeCommentInput() {
    this.setState({
      showCommentInput: false,
      comment: '',
      commentInputHeight: 0
    });
  }

  //前往公告详情(先判断是否是本人发布的动态,然后获取公告详情和评论列表)
  _goAnnouncementDetail(rowData) {
    this._closeCommentInput();
    navigator.push({
      component: AnnouncementDetail,
      name: 'AnnouncementDetail',
      params: {
        Id: rowData.Id,
        isSelf: tmpGlobal.currentUser.UserId === rowData.CreaterId
      }
    });
  }

  _renderMoreImgLabel(arr, index) {
    if (arr.length > 3 && index === 2) {
      return (
        <View style={styles.moreImgLabel}>
          <Icon name={'picture-o'} size={10} style={styles.moreImgIcon}/>
          <Text style={styles.moreImgText}>{arr.length}</Text>
        </View>
      )
    } else {
      return null
    }
  }

  //渲染公告中的图片
  renderPostImage(arr) {
    if (arr.length !== 0) {
      let imageWidth = 0;
      if (arr.length % 3 === 0) {
        imageWidth = (width - 60) / 3;
      } else if (arr.length === 2) {
        imageWidth = (width - 50) / 2;
      } else {
        imageWidth = (width - 60) / 3;
      }
      let arrCopy = JSON.parse(JSON.stringify(arr));
      if (arr.length > 3) {
        arrCopy.splice(3, arr.length - 3);
      }
      return arrCopy.map((item, index)=> {
        return (
          <View key={index} style={styles.singleImgContainer}>
            <Image
              onLoadEnd={()=> {
                this.setState({imgLoading: false})
              }}
              style={{width: imageWidth, height: imageWidth}}
              source={{uri: URL_DEV + '/' + item}}>
              {this.state.imgLoading ?
                <Image
                  source={require('./img/imgLoading.gif')}
                  style={{width: imageWidth, height: imageWidth}}/> : null}
            </Image>
            {this._renderMoreImgLabel(arr, index)}
          </View>
        )
      })
    } else {
      return null;
    }
  }

  _openImgModal(arr) {
    let tmpArr = [];
    for (let i = 0; i < arr.length; i++) {
      tmpArr.push(URL_DEV + '/' + arr[i]);
    }
    this.setState({
      imgList: tmpArr
    }, ()=> {
      this.refs.modalFullScreen.open();
    });
  }

  _closeImgModal() {
    this.refs.modalFullScreen.close();
  }

  //发送评论
  _sendComment() {
    //发送评论,并给当前广告评论数加一
    const {dispatch}=this.props;
    let data = {
      postId: commentId,
      forCommentId: null,
      comment: this.state.comment
    };

    //关闭评论输入框,并情况评论框内容
    this._closeCommentInput();

    let index = this.state.postList.findIndex((item)=> {
      return item.Id === commentId;
    });
    this.state.postList[index].CommentCount += 1;

    dispatch(HomeActions.comment(data, (json)=> {
      toastShort('评论成功');
      this.setState({
        postList: [
          ...this.state.postList
        ]
      });
    }, (error)=> {
    }));
  }

  _resetScrollTo() {
    Animated.timing(
      this.state.viewMarginBottom,
      {
        toValue: 0,
        duration: 10,
      }
    ).start();
  }

  //多行评论输入框增加最大高度限制
  _handleInputHeight(event) {
    this.setState({
      comment: event.nativeEvent.text,
      commentInputHeight: Math.min(event.nativeEvent.contentSize.height, 80)
    })
  }

  _renderCommentInputBar() {
    if (this.state.showCommentInput) {
      return (
        <Animated.View
          style={{
            flexDirection: 'row',
            padding: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#E2E2E2',
            marginBottom: this.state.viewMarginBottom
          }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}>
            <TextInput
              ref={'comment'}
              multiline={true}
              style={[{
                flex: 1,
                backgroundColor: '#fff',
                borderRadius: 4,
                paddingHorizontal: 10,
                flexWrap: 'wrap',
                height: 40
              }, {
                height: Math.max(40, this.state.commentInputHeight)
              }]}
              underlineColorAndroid={'transparent'}
              placeholder={'请输入回复'}
              maxLength={50}
              onChange={this._handleInputHeight}
              value={this.state.comment}/>
          </View>
          <View>
            <NBButton
              primary
              style={{
                width: 100,
                marginLeft: 10
              }}
              onPress={()=> {
                this._sendComment()
              }}>
              发送
            </NBButton>
          </View>
        </Animated.View>
      )
    } else {
      return null
    }
  }

  renderBody() {
    return (
      <View
        ref={'root'}
        style={[styles.container]}>
        <SubTabView
          tabIndex={(index)=> {
            this.setState({tabIndex: index})
          }}
          renderPostImage={this.renderPostImage.bind(this)}
          _goUserInfo={this._goUserInfo.bind(this)}
          _goAnnouncementDetail={this._goAnnouncementDetail.bind(this)}
          data={this.state.postList}
          appointmentData={this.state.appointmentList}
          pageSize={this.state.pageSize}
          appointmentPageSize={this.state.appointmentPageSize}
          _renderFooter={this._renderFooter.bind(this)}
          _toEnd={this._toEnd.bind(this)}
          _doLike={this._doLike.bind(this)}
          _showCommentInput={this._showCommentInput.bind(this)}
          _closeCommentInput={this._closeCommentInput.bind(this)}
          _onRefresh={this._onRefresh.bind(this)}
          _openImgModal={this._openImgModal.bind(this)}/>
        <ActionSheet
          ref={(o) => this.ActionSheet = o}
          title="请选择你的操作"
          options={buttons}
          cancelButtonIndex={CANCEL_INDEX}
          destructiveButtonIndex={DESTRUCTIVE_INDEX}
          onPress={this._actionSheetPress.bind(this)}
        />
        {this._renderCommentInputBar()}
      </View>
    )
  }

  renderModal() {
    return (
      <ModalBox
        style={{
          position: 'absolute',
          width: width,
          ...Platform.select({
            ios: {
              height: height - 46
            },
            android: {
              height: height - 50
            }
          }),
          backgroundColor: 'rgba(40,40,40,0.8)',
        }}
        backButtonClose={true}
        position={"center"}
        ref={"modalFullScreen"}
        swipeToClose={true}
        onClosingState={this.onClosingState}>
        <PhotoScaleViewer
          index={this.state.showIndex}
          pressHandle={()=> {
            console.log('你点击了图片,此方法必须要有,否则不能切换下一张图片')
          }}
          imgList={this.state.imgList}/>
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: 20,
            ...Platform.select({
              ios: {
                top: 15
              },
              android: {
                top: 10
              }
            }),
          }}
          onPress={()=> {
            this._closeImgModal()
          }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <IonIcon name={'ios-close-outline'} size={44} color={'#fff'} style={{
              fontWeight: '100'
            }}/>
          </View>
        </TouchableOpacity>
      </ModalBox>
    )
  }

  renderSpinner() {
    if (this.props.pendingStatus) {
      return (
        <Spinner animating={this.props.pendingStatus}/>
      )
    }
  }
}

export default connect((state)=> {
  return {
    ...state,
    result: state.InitialApp.res,
    pendingStatus: state.InitialApp.pending
  }
})(Home)