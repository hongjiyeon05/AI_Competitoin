import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle, useColorScheme } from 'react-native';

interface ThemedTextProps extends TextProps {
  type?: 'title' | 'default';
  children: React.ReactNode;
}

export function ThemedText({ type = 'default', children, style, ...props }: ThemedTextProps) {
  const theme = useColorScheme(); // 'light' | 'dark'

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    };

    if (type === 'title') {
      return StyleSheet.flatten([{ fontSize: 20, fontWeight: 'bold' }, baseStyle, style]);
    }

    return StyleSheet.flatten([baseStyle, style]);
  };

  return (
    <Text style={getTextStyle()} {...props}>
      {children}
    </Text>
  );
}
