import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Calculator, TrendingUp } from 'lucide-react-native';

export interface FinancialToolsProps {
  propertyPrice: number;
  purpose: 'SELL' | 'RENT';
}

export function FinancialTools({ propertyPrice, purpose }: FinancialToolsProps) {
  if (purpose === 'SELL') {
    // EMI Calculator
    const interestRate = 8; // Annual interest rate
    const tenureYears = 20; // Years
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;
    const emi = (propertyPrice * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    return (
      <View className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 my-4">
        <View className="flex-row items-center mb-5">
          <View className="bg-indigo-50 p-2.5 rounded-2xl mr-3">
            <Calculator size={22} color="#4f46e5" />
          </View>
          <Text className="text-lg font-bold text-slate-800">EMI Calculator</Text>
        </View>
        
        <View className="flex-row justify-between mb-3">
          <Text className="text-slate-500 font-medium">Property Price</Text>
          <Text className="font-semibold text-slate-800">${propertyPrice.toLocaleString()}</Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-slate-500 font-medium">Interest Rate</Text>
          <Text className="font-semibold text-slate-800">{interestRate}% p.a.</Text>
        </View>
        <View className="flex-row justify-between mb-5">
          <Text className="text-slate-500 font-medium">Tenure</Text>
          <Text className="font-semibold text-slate-800">{tenureYears} Years</Text>
        </View>
        
        <View className="bg-indigo-50/50 p-4 rounded-2xl items-center border border-indigo-100">
          <Text className="text-indigo-600/80 text-sm font-medium mb-1">Estimated Monthly EMI</Text>
          <Text className="text-3xl font-extrabold text-indigo-700">${Math.round(emi).toLocaleString()}</Text>
        </View>
      </View>
    );
  }

  // ROI Calculator for RENT
  // We assume propertyPrice is the monthly rent in this context.
  // The user can enter the estimated property value to calculate the ROI.
  const [estimatedValue, setEstimatedValue] = useState<string>((propertyPrice * 12 * 15).toString());
  
  const valueNum = parseFloat(estimatedValue) || 1;
  const annualRent = propertyPrice * 12;
  const roi = (annualRent / valueNum) * 100;

  return (
    <View className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 my-4">
      <View className="flex-row items-center mb-5">
        <View className="bg-emerald-50 p-2.5 rounded-2xl mr-3">
          <TrendingUp size={22} color="#10b981" />
        </View>
        <Text className="text-lg font-bold text-slate-800">ROI Calculator</Text>
      </View>

      <View className="flex-row justify-between mb-3 items-center">
        <Text className="text-slate-500 font-medium">Monthly Rent</Text>
        <Text className="font-semibold text-slate-800">${propertyPrice.toLocaleString()}</Text>
      </View>
      
      <View className="flex-row justify-between mb-5 items-center">
        <Text className="text-slate-500 font-medium">Property Value ($)</Text>
        <TextInput 
          className="border border-slate-200 rounded-xl px-4 py-2 text-right font-semibold text-slate-800 min-w-[120px] bg-slate-50"
          keyboardType="numeric"
          value={estimatedValue}
          onChangeText={setEstimatedValue}
          placeholder="Value"
        />
      </View>

      <View className="bg-emerald-50/50 p-4 rounded-2xl items-center border border-emerald-100">
        <Text className="text-emerald-600/80 text-sm font-medium mb-1">Annual Rental Yield</Text>
        <Text className="text-3xl font-extrabold text-emerald-700">{roi.toFixed(2)}%</Text>
      </View>
    </View>
  );
}
