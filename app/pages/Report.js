/**
 *
 * @author keyy/1501718947@qq.com 17/2/4 14:00
 * @description
 */
import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableHighlight,
  Switch,
  InteractionManager,
  Platform,
  DeviceEventEmitter,
  NativeAppEventEmitter,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {Button as NBButton} from 'native-base'
import BaseComponent from '../base/BaseComponent'
import {connect} from 'react-redux'
import * as HomeActions from '../actions/Home'
import {toastShort} from '../utils/ToastUtil'
import tmpGlobal from '../utils/TmpVairables'
import * as Storage from '../utils/Storage'
import customTheme from '../themes/MyThemes'
import {ComponentStyles,CommonStyles} from '../style'

const styles = StyleSheet.create({
  scrollView: {
    flex: 1
  },
  tipsText: {
    fontSize: 14,
    padding: 10
  },
  reportContainer: {
    backgroundColor: '#fff'
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F3F3',
  },
  itemText: {
    fontSize: 14
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff'
  },
  blockBtn: {
    paddingHorizontal: 10
  },
});

let navigator;
let emitter;

class Report extends BaseComponent {

  constructor(props) {
    super(props);
    this.state = {
      ...this.props.route.params,
      reportArr: [
        {text: '骚扰辱骂', value: 1, checked: false},
        {text: '淫秽色情', value: 2, checked: false},
        {text: '垃圾广告', value: 3, checked: false},
        {text: '血腥暴力', value: 4, checked: false},
        {text: '欺诈(酒托、话费托等)', value: 5, checked: false},
        {text: '违法行为(诈骗、违禁品、反动等)', value: 6, checked: false},
        {text: '个人资料不符实', value: 7, checked: false}
      ],
      addToBackList: false,
      reportType: null,
    };
    navigator = this.props.navigator;
    emitter = Platform.OS === 'ios' ? NativeAppEventEmitter : DeviceEventEmitter;
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(()=> {
      this.isInBlackList();
    });
  }

  componentWillUnmount() {
    if (this.reportTimer) {
      clearTimeout(this.reportTimer);
    }
  }

  getNavigationBarProps() {
    return {
      title: '举报用户'
    };
  }

  isInBlackList() {
    const {dispatch}=this.props;
    let data = {
      blackUserId: this.state.UserId
    };
    dispatch(HomeActions.isInBlackList(data, (json)=> {
      this.setState({
        addToBackList: json.Result
      });
    }, (error)=> {
    }));
  }

  _deleteRecordRow(userId) {
    Storage.getItem(`${tmpGlobal.currentUser.UserId}_MsgList`).then((res)=> {
      let index = res.findIndex((item)=> {
        return userId === item.SenderId;
      });
      if (index !== -1) {
        res.splice(index, 1);
        Storage.setItem(`${tmpGlobal.currentUser.UserId}_MsgList`, res);
        emitter.emit('MessageCached',{data:true,message:'拉黑成功,并删除缓存中响应聊天记录'});
      }
    });
  }

  report() {
    const {dispatch}=this.props;
    let data = {
      ForUserId: this.state.UserId,
      ReportType: this.state.reportType,
      Remark: ''
    };
    dispatch(HomeActions.report(data, (json)=> {
      if (this.state.addToBackList) {
        dispatch(HomeActions.putToBlackList(data, (json)=> {
          this._deleteRecordRow(this.state.UserId);
          toastShort('举报成功');
          let routes = navigator.getCurrentRoutes();
          this.reportTimer = setTimeout(()=> {
            navigator.popToRoute(routes[routes.length-3]);
          }, 1000)
        }, (error)=> {
        }));
      } else {
        toastShort('举报成功');
        this.reportTimer = setTimeout(()=> {
          navigator.pop();
        }, 1000)
      }
    }, (error)=> {
    }));
  }

  checkedItem(index) {
    this.state.reportArr.forEach((e)=> {
      e.checked = false;
    });
    this.state.reportArr[index].checked = true;
    this.setState({
      reportArr: this.state.reportArr,
      reportType: this.state.reportArr[index].value
    });
  }

  renderReportList(arr) {
    return (
      <View style={styles.reportContainer}>
        {arr.map((item, index)=>
          this.renderRadioItem(item, index)
        )}
      </View>
    )
  }

  renderRadioItem(item, index) {
    return (
      <TouchableHighlight
        onPress={()=> {
          this.checkedItem(index)
        }}
        underlayColor={'#b8b8bf'}
        key={index}>
        <View style={styles.itemRow}>
          <Text style={styles.itemText}>{item.text}</Text>
          {item.checked ? <View style={styles.iconBox}>
            <Icon name={'check'} size={18}/>
          </View> : null}
        </View>
      </TouchableHighlight>
    )
  }

  renderAddToBlackList() {
    return (
      <View style={styles.switchItem}>
        <Text>
          {'同时拉黑TA'}
        </Text>
        <Switch
          onValueChange={(value)=> {
            this.setState({
              addToBackList: value
            })
          }}
          value={this.state.addToBackList === true}/>
      </View>
    )
  }

  renderReportButton() {
    return (
      <View style={styles.blockBtn}>
        <NBButton
          theme={customTheme}
          block
          small
          style={{marginTop: 20, height: 40, alignItems: 'center'}}
          onPress={()=>this.report()}
          disabled={this.state.reportType === null}>
          举报
        </NBButton>
      </View>
    )
  }

  renderBody() {
    return (
      <View style={ComponentStyles.container}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.tipsText}>{'请告诉我们你想举报该用户的理由'}</Text>
          {this.renderReportList(this.state.reportArr)}
          {this.renderAddToBlackList()}
          {this.renderReportButton()}
        </ScrollView>
      </View>
    )
  }
}

export default connect((state)=> {
  return {
    ...state
  }
})(Report)
