import React from 'react';
import { View, Text, Button, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';

const slides = [
  { title: 'Welcome', text: 'Mark your attendance using face recognition.' },
  { title: 'Secure', text: 'Your data is securely handled.' },
  { title: 'Let’s Go!', text: 'Get started with your first scan.' },
];

export default function OnboardingCarousel({ onDone }) {
  return (
    <Swiper loop={false} showsButtons>
      {slides.map((slide, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 30,
            backgroundColor: '#f0f0f0',
          }}
        >
          <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 15 }}>
            {slide.title}
          </Text>
          <Text style={{ fontSize: 18, textAlign: 'center', color: '#555' }}>
            {slide.text}
          </Text>
          {index === slides.length - 1 && (
            <View style={{ marginTop: 20 }}>
              <Button title="Get Started" onPress={onDone} />
            </View>
          )}
        </View>
      ))}
    </Swiper>
  );
}
