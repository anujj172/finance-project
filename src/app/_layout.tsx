import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Drawer } from 'expo-router/drawer'; 
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { FinanceProvider } from '../hooks/useFinance'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // 👈 Хадгаламжийн гахайн дүрсэнд зориулж MaterialCommunityIcons нэмэв

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <FinanceProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
    
        <Drawer 
          screenOptions={{ 
            headerShown: false,      
            drawerPosition: 'left',   
            drawerType: 'front',      
            drawerActiveTintColor: '#0F172A', 
            drawerInactiveTintColor: '#64748B', 
            drawerLabelStyle: {
              fontSize: 15,
              fontWeight: '500',
              marginLeft: -10,        
            },
            drawerStyle: {
              width: 260,             
              backgroundColor: '#FFFFFF',
            }
          }}
        >
          {/* Нэвтрэх болон бүртгүүлэх хуудсыг цэс дээр харуулахгүй нуух */}
          <Drawer.Screen 
            name="index" 
            options={{ drawerItemStyle: { display: 'none' } }} 
          />
          <Drawer.Screen 
            name="register" 
            options={{ drawerItemStyle: { display: 'none' } }} 
          />

          {/* 📊 Хянах самбар (Dashboard) */}
          <Drawer.Screen 
            name="dashboard" 
            options={{ 
              drawerLabel: 'Хянах самбар',
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="grid-outline" size={size} color={color} />
              )
            }} 
          />

          {/* 📈 Орлого */}
          <Drawer.Screen 
            name="income" 
            options={{ 
              drawerLabel: 'Орлого',
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="trending-up-outline" size={size} color={color} />
              )
            }} 
          />

          {/* 📉 Зарлага */}
          <Drawer.Screen 
            name="expense" 
            options={{ 
              drawerLabel: 'Зарлага',
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="trending-down-outline" size={size} color={color} />
              )
            }} 
          /> 

          {/* 🐖 Хадгаламж (ШИНЭЭР НЭМЭВ) */}
          <Drawer.Screen 
            name="savings" 
            options={{ 
              drawerLabel: 'Хадгаламж',
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <MaterialCommunityIcons name="piggy-bank-outline" size={size + 2} color={color} /> // Гахай арай жижиг харагддаг тул size + 2 болгов
              )
            }} 
          /> 

          {/* 💳 Зээл */}
          <Drawer.Screen 
            name="loan" 
            options={{ 
              drawerLabel: 'Зээл',
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="card-outline" size={size} color={color} />
              )
            }} 
          /> 

          {/* 🧳 Төсөв */}
          <Drawer.Screen 
            name="budget" 
            options={{ 
              drawerLabel: 'Төсөв',
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="wallet-outline" size={size} color={color} />
              )
            }} 
          /> 
        </Drawer>
      </ThemeProvider>
    </FinanceProvider>
  );
}