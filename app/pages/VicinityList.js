/**
 *
 * @author keyy/1501718947@qq.com 16/11/9 11:57
 * @description
 */
import React,{Component} from 'react'
import {
  View,
  StyleSheet,
  Text
} from 'react-native'
import * as InitialAppActions from '../actions/InitialApp'
import {connect} from 'react-redux'
import {ComponentStyles} from '../style'
import BaseComponent from '../base/BaseComponent'

const styles=StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3'
  },
});

class VicinityList extends BaseComponent{
  constructor(props){
    super(props);
  }

  getNavigationBarProps() {
    return {
      title: '附近',
      hideRightButton: false,
      rightIcon: {
        name: 'ellipsis-v'
      },
    };
  }

  renderBody(){
    return(
      <View style={styles.container}>
        <Text>{'附近列表模式'}</Text>
      </View>
    )
  }
}

export default VicinityList
