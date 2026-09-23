import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Calculator, TrendingUp, Scale, Map as MapIcon } from 'lucide-react-native';

export interface FinancialToolsProps {
  propertyPrice: number;
  purpose: 'SELL' | 'BUY' | 'RENT';
}

export function FinancialTools({ propertyPrice, purpose }: FinancialToolsProps) {
  if (purpose === 'SELL' || purpose === 'BUY') {
    // EMI Calculator States
    const [downPaymentStr, setDownPaymentStr] = useState<string>((propertyPrice * 0.2).toString());
    const [interestRateStr, setInterestRateStr] = useState<string>('8.5');
    const [tenureYearsStr, setTenureYearsStr] = useState<string>('20');

    const downPayment = parseFloat(downPaymentStr) || 0;
    const principal = Math.max(0, propertyPrice - downPayment);
    const interestRate = parseFloat(interestRateStr) || 8.5;
    const tenureYears = parseFloat(tenureYearsStr) || 20;
    
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;
    let emi = 0;
    
    if (r > 0 && n > 0 && principal > 0) {
        emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else if (principal > 0 && n > 0) {
        emi = principal / n;
    }

    return (
      <View className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 my-4">
        <View className="flex-row items-center mb-5">
          <View className="bg-indigo-50 p-2.5 rounded-2xl mr-3">
            {/* @ts-ignore */}
            <Calculator size={22} color="#4f46e5" />
          </View>
          <Text className="text-lg font-bold text-slate-800">EMI Calculator</Text>
        </View>
        
        <View className="flex-row justify-between mb-3 items-center">
          <Text className="text-slate-500 font-medium">Property Price</Text>
          <Text className="font-semibold text-slate-800">₹{propertyPrice.toLocaleString('en-IN')}</Text>
        </View>
        
        <View className="flex-row justify-between mb-3 items-center">
          <Text className="text-slate-500 font-medium">Down Payment (₹)</Text>
          <TextInput 
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-right font-semibold text-slate-800 min-w-[100px] bg-slate-50"
            keyboardType="numeric"
            value={downPaymentStr}
            onChangeText={setDownPaymentStr}
            placeholder="Amount"
          />
        </View>

        <View className="flex-row justify-between mb-3 items-center">
          <Text className="text-slate-500 font-medium">Loan Amount</Text>
          <Text className="font-semibold text-slate-800">₹{principal.toLocaleString('en-IN')}</Text>
        </View>

        <View className="flex-row justify-between mb-3 items-center">
          <Text className="text-slate-500 font-medium">Interest Rate (% p.a.)</Text>
          <TextInput 
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-right font-semibold text-slate-800 min-w-[80px] bg-slate-50"
            keyboardType="numeric"
            value={interestRateStr}
            onChangeText={setInterestRateStr}
            placeholder="Rate"
          />
        </View>

        <View className="flex-row justify-between mb-5 items-center">
          <Text className="text-slate-500 font-medium">Tenure (Years)</Text>
          <TextInput 
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-right font-semibold text-slate-800 min-w-[80px] bg-slate-50"
            keyboardType="numeric"
            value={tenureYearsStr}
            onChangeText={setTenureYearsStr}
            placeholder="Years"
          />
        </View>
        
        <View className="bg-indigo-50/50 p-4 rounded-2xl items-center border border-indigo-100">
          <Text className="text-indigo-600/80 text-sm font-medium mb-1">Estimated Monthly EMI</Text>
          <Text className="text-3xl font-extrabold text-indigo-700">₹{Math.round(emi).toLocaleString('en-IN')}</Text>
        </View>
      </View>
    );
  }

  // ROI Calculator for RENT
  const [estimatedValue, setEstimatedValue] = useState<string>((propertyPrice * 12 * 15).toString());
  
  const valueNum = parseFloat(estimatedValue) || 1;
  const annualRent = propertyPrice * 12;
  const roi = (annualRent / valueNum) * 100;

  return (
    <View className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 my-4">
      <View className="flex-row items-center mb-5">
        <View className="bg-emerald-50 p-2.5 rounded-2xl mr-3">
          {/* @ts-ignore */}
          <TrendingUp size={22} color="#10b981" />
        </View>
        <Text className="text-lg font-bold text-slate-800">ROI Calculator</Text>
      </View>

      <View className="flex-row justify-between mb-3 items-center">
        <Text className="text-slate-500 font-medium">Monthly Rent</Text>
        <Text className="font-semibold text-slate-800">₹{propertyPrice.toLocaleString('en-IN')}</Text>
      </View>
      
      <View className="flex-row justify-between mb-5 items-center">
        <Text className="text-slate-500 font-medium">Property Value (₹)</Text>
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

const AREA_UNITS: Record<string, number> = {
  'Sq Ft': 1,
  'Sq Meter': 10.7639,
  'Sq Yard': 9,
  'Acre': 43560,
  'Hectare': 107639,
  'Bigha': 27225,
  'Gunta': 1089,
};

export function AreaConverter() {
  const [inputValue, setInputValue] = useState<string>('1000');
  const [fromUnit, setFromUnit] = useState<string>('Sq Ft');
  
  const value = parseFloat(inputValue) || 0;
  const valueInSqFt = value * AREA_UNITS[fromUnit];

  return (
    <View className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 my-4">
      <View className="flex-row items-center mb-5">
        <View className="bg-orange-50 p-2.5 rounded-2xl mr-3">
          {/* @ts-ignore */}
          <MapIcon size={22} color="#ea580c" />
        </View>
        <Text className="text-lg font-bold text-slate-800">Area Converter</Text>
      </View>

      <View className="flex-row items-center mb-6">
        <TextInput 
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-semibold text-slate-900 mr-3"
          keyboardType="numeric"
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Enter value"
        />
        <View className="bg-slate-100 rounded-xl px-3 py-3 border border-slate-200">
          <Text className="font-semibold text-slate-700">{fromUnit}</Text>
        </View>
      </View>

      <View className="flex-row flex-wrap mb-4 gap-2">
        {Object.keys(AREA_UNITS).map((unit) => (
          <Pressable 
            key={unit} 
            onPress={() => setFromUnit(unit)}
            className={`px-3 py-1.5 rounded-full border ${fromUnit === unit ? 'bg-orange-100 border-orange-200' : 'bg-slate-50 border-slate-200'}`}
          >
            <Text className={`text-xs font-semibold ${fromUnit === unit ? 'text-orange-700' : 'text-slate-600'}`}>{unit}</Text>
          </Pressable>
        ))}
      </View>

      <View className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-3">
        {Object.keys(AREA_UNITS).map((unit) => {
          if (unit === fromUnit) return null;
          const converted = valueInSqFt / AREA_UNITS[unit];
          return (
            <View key={unit} className="flex-row justify-between items-center border-b border-orange-100/50 pb-2 mb-1 last:border-0 last:pb-0 last:mb-0">
              <Text className="text-slate-600 font-medium">{unit}</Text>
              <Text className="font-bold text-orange-700">
                {converted < 1 ? converted.toFixed(4) : converted.toFixed(2)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function RentVsBuyCalculator() {
  const [rentStr, setRentStr] = useState<string>('20000');
  const [priceStr, setPriceStr] = useState<string>('7500000');
  const [tenureStr, setTenureStr] = useState<string>('15');
  const [interestStr, setInterestStr] = useState<string>('8.5');

  const monthlyRent = parseFloat(rentStr) || 0;
  const propertyPrice = parseFloat(priceStr) || 0;
  const tenureYears = parseFloat(tenureStr) || 0;
  const interestRate = parseFloat(interestStr) || 0;

  // Simplified Calculations
  const rentInflation = 0.05; // 5% annual increase
  const propertyAppreciation = 0.06; // 6% annual appreciation
  
  // Rent Scenario
  let totalRentPaid = 0;
  let currentYearRent = monthlyRent * 12;
  for(let i=0; i<tenureYears; i++) {
    totalRentPaid += currentYearRent;
    currentYearRent *= (1 + rentInflation);
  }

  // Buy Scenario
  const downPayment = propertyPrice * 0.2;
  const loanAmount = propertyPrice - downPayment;
  const r = interestRate / 12 / 100;
  const n = tenureYears * 12;
  let emi = 0;
  if (r > 0 && n > 0 && loanAmount > 0) {
      emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }
  const totalEmiPaid = emi * n;
  const totalCostToBuy = downPayment + totalEmiPaid;
  
  const futurePropertyValue = propertyPrice * Math.pow(1 + propertyAppreciation, tenureYears);
  const netBuyCost = totalCostToBuy - (futurePropertyValue - propertyPrice);

  const buyIsBetter = netBuyCost < totalRentPaid;

  return (
    <View className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 my-4">
      <View className="flex-row items-center mb-5">
        <View className="bg-blue-50 p-2.5 rounded-2xl mr-3">
          {/* @ts-ignore */}
          <Scale size={22} color="#2563eb" />
        </View>
        <Text className="text-lg font-bold text-slate-800">Rent vs Buy</Text>
      </View>

      <View className="flex-row justify-between mb-3 items-center">
        <Text className="text-slate-500 font-medium">Current Monthly Rent (₹)</Text>
        <TextInput 
          className="border border-slate-200 rounded-xl px-3 py-1.5 text-right font-semibold text-slate-800 min-w-[100px] bg-slate-50"
          keyboardType="numeric"
          value={rentStr}
          onChangeText={setRentStr}
        />
      </View>
      <View className="flex-row justify-between mb-3 items-center">
        <Text className="text-slate-500 font-medium">Property Price (₹)</Text>
        <TextInput 
          className="border border-slate-200 rounded-xl px-3 py-1.5 text-right font-semibold text-slate-800 min-w-[120px] bg-slate-50"
          keyboardType="numeric"
          value={priceStr}
          onChangeText={setPriceStr}
        />
      </View>
      <View className="flex-row justify-between mb-3 items-center">
        <Text className="text-slate-500 font-medium">Loan Interest (%)</Text>
        <TextInput 
          className="border border-slate-200 rounded-xl px-3 py-1.5 text-right font-semibold text-slate-800 min-w-[80px] bg-slate-50"
          keyboardType="numeric"
          value={interestStr}
          onChangeText={setInterestStr}
        />
      </View>
      <View className="flex-row justify-between mb-5 items-center">
        <Text className="text-slate-500 font-medium">Period (Years)</Text>
        <TextInput 
          className="border border-slate-200 rounded-xl px-3 py-1.5 text-right font-semibold text-slate-800 min-w-[80px] bg-slate-50"
          keyboardType="numeric"
          value={tenureStr}
          onChangeText={setTenureStr}
        />
      </View>

      <View className="space-y-3 mb-4">
        <View className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <Text className="text-xs text-slate-500 mb-1">Total Rent Paid (5% inflation)</Text>
          <Text className="font-bold text-slate-800 text-lg">₹{Math.round(totalRentPaid).toLocaleString('en-IN')}</Text>
        </View>
        <View className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <Text className="text-xs text-slate-500 mb-1">Total Cost to Buy (Downpayment + EMI)</Text>
          <Text className="font-bold text-slate-800 text-lg">₹{Math.round(totalCostToBuy).toLocaleString('en-IN')}</Text>
        </View>
        <View className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <Text className="text-xs text-slate-500 mb-1">Future Property Value (6% apprc.)</Text>
          <Text className="font-bold text-emerald-600 text-lg">₹{Math.round(futurePropertyValue).toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View className={`p-4 rounded-2xl items-center border ${buyIsBetter ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
        <Text className={`text-sm font-medium mb-1 ${buyIsBetter ? 'text-emerald-700' : 'text-amber-700'}`}>Verdict for {tenureYears} Years</Text>
        <Text className={`text-xl font-extrabold ${buyIsBetter ? 'text-emerald-800' : 'text-amber-800'}`}>
          {buyIsBetter ? 'Buying is Better' : 'Renting is Better'}
        </Text>
      </View>
    </View>
  );
}
