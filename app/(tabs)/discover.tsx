import { View, Text, Image, ImageBackground, StyleSheet, Dimensions } from 'react-native'
import React from 'react'

const { width, height } = Dimensions.get('window')

const discover = () => {
  return (
    <View style={styles.container}>
      <ImageBackground 
          source={require('../../assets/images/bg.jpg')}
          style={styles.contentContainer}
          imageStyle={styles.backgroundImage}
          resizeMode="cover"
        >
        <Image
         source={require('../../assets/images/icon.png')}
         style={{ width: 100, height: 100, alignSelf: 'center', marginBottom: 5 }}
        />
        <Text>discover</Text>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  contentContainer: {
    flex: 1,
    width: width,
    height: height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    width: width,
    height: height,
  },
})

export default discover
