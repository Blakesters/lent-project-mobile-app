import React from 'react';
import { Text, View, ImageBackground, TouchableWithoutFeedback, TouchableHighlight, TouchableOpacity, Image, Slider } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import { Audio, Video } from 'expo';

let soundObject;

export default class CalendarDayScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audioPlaying: false,
      audioPaused: false,
      playbackInstance: null,
      playbackInstancePosition: 0,
      playbackInstanceDuration: null,
      isSeeking: false,
      shouldPlay: false,
      isPlaying: false,
      shouldPlayAtEndOfSeek: false,
    };
  }

  _onPlaybackStatusUpdate(status) {
    // alert(this.state.shouldPlay)
    if (status.isLoaded) {
      this.setState({
        playbackInstancePosition: status.positionMillis,
        playbackInstanceDuration: status.durationMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying
      });
      if (status.didJustFinish) {
        // alert('finished')
        this.setState({
          playbackInstancePosition: 0,
          isPlaying: false,
          audioPlaying: false
        });
      }
    } else {
      if (status.error) {
        alert(status.error);
      }
    }
  }

  _getSeekSliderPosition() {
    if (this.state.playbackInstancePosition !== null 
          && this.state.playbackInstanceDuration !== null
          && this.state.isPlaying !== false) {
          // alert(this.state.playbackInstancePosition / this.state.playbackInstanceDuration)
          return (this.state.playbackInstancePosition / this.state.playbackInstanceDuration);  
    } else {
      return 0;
    }
  }

  _onSeekSliderValueChange(value) {
    if (this.state.playbackInstance !== null && !this.state.isSeeking) {
      this.isSeeking = true;
      // this.state.shouldPlayAtEndOfSeek = this.state.shouldPlay;
      this.state.playbackInstance.pauseAsync();
    }
  }

  async _onSeekSliderSlidingComplete(value) {
    if (this.state.playbackInstance !== null) {
      this.state.isSeeking = false;
      const seekPosition = value * this.state.playbackInstanceDuration;
      if (this.state.audioPlaying) {
        try {
          await this.state.playbackInstance.playFromPositionAsync(seekPosition);
          // await this.state.playbackInstance.playAsync();
        } catch (error) {
          alert(error);
        }
      } else {
          try {
            await this.state.playbackInstance.setPositionAsync(seekPosition);
          } catch (error) {
              alert(error);
          }
      }
    }
  }

  async playAndPauseAudio() {
    try {
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        playThroughEarpieceAndroid: false,
        shouldDuckAndroid: true
      });
    } catch (error) {
      alert(error);
    }
    
    soundObject = new Audio.Sound();
    
    try {
      if (this.state.audioPlaying === false) {
        // for multiple audio files on diff days, you may need to unload first
        await soundObject.loadAsync(require('../assets/sounds/early_morning_fog.mp3'));
        if (this.state.playbackInstance !== null) {
          await this.state.playbackInstance.playAsync();
          this.setState({
            audioPlaying: true,
            audioPaused: false
          });
        } else {
          await soundObject.playAsync();
          this.setState({
            audioPlaying: true,
            playbackInstance: soundObject,
            audioPaused: false
          });
          this.state.playbackInstance.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate.bind(this));
        }
      } else {
        await this.state.playbackInstance.pauseAsync();
        this.setState({
          audioPlaying: false,
          audioPaused: true
        });
      }
    } catch (error) {
      alert(error);
    }
  }

  async stopAudio() {
    if (soundObject !== undefined) {
      try {
        await this.state.playbackInstance.stopAsync();
        this.setState({
          audioPlaying: false,
          // move it back to the beginning
          playbackInstancePosition: 0
        });
      } catch (error) {
        alert(error);
      }
    }
  }

  render() {
  
    if (this.state.audioPlaying === true) {
      playButtonSource = require('../img/icons/pause.png');
    } else {
      playButtonSource = require('../img/icons/play.png');
    }

    return ( 
      <View style={{ backgroundColor: '#000', flex: 1}}>
        <TouchableHighlight
          style={{flex: 9}} 
          onPress={() => {
          this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'Home' })
            ],
          })) 
        }}>
          <ImageBackground source={require('../img/photo1.png')} 
                          style={{flex: 1, height: undefined, width: undefined}}
                          resizeMode="cover"
                          >
          
          </ImageBackground>
        </TouchableHighlight>
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgb(68,68,68)'}}>
            <Image source={require('../img/icons/music.png')} 
                    style={{width: 20, height: 20, marginRight: 5, marginLeft: 5}}></Image>
            <Text style={{color: 'rgb(185,185,185)'}}>Music:</Text>
            <TouchableOpacity onPress={() => {
              this.playAndPauseAudio();
            }}>
              <Image source={playButtonSource} 
                      style={{width: 25, height: 25, marginRight: 10, marginLeft: 10}}></Image>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              if (this.state.audioPlaying === true) {
                this.stopAudio();
              }
            }}>
              <Image source={require('../img/icons/stop.png')} 
                      style={{width: 25, height: 25, marginRight: 10, marginLeft: 10}}></Image>
            </TouchableOpacity>
            <Slider style={{width: 130, height: 20, marginLeft: 10 }} 
                    value={this._getSeekSliderPosition()} 
                    onValueChange={this._onSeekSliderValueChange.bind(this)} 
                    onSlidingComplete={this._onSeekSliderSlidingComplete.bind(this)} />
          </View>
      </View>
    );
  }
}