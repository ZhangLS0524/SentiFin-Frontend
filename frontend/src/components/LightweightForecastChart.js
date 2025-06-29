import React, { useEffect, useRef } from 'react';
import { createChart, LineSeries } from 'lightweight-charts';

/**
 * Props:
 *   historicalData: Array<{ time: string (YYYY-MM-DD), value: number }> - Previous price data
 *   forecastData: Array<{ time: string (YYYY-MM-DD), value: number }> - Predicted price data
 *   height?: number
 */
const LightweightForecastChart = ({ historicalData, forecastData, height = 300 }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const historicalSeriesRef = useRef();
  const forecastSeriesRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    try {
      // Clean up previous chart
      if (chartRef.current) {
        chartRef.current.remove();
      }
      
      // Check if createChart is available
      if (typeof createChart !== 'function') {
        console.error('createChart is not available. Make sure lightweight-charts is properly installed.');
        return;
      }
      
      console.log('Creating chart with historical data:', historicalData);
      console.log('Creating chart with forecast data:', forecastData);
      
      // Create chart
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height,
        layout: {
          background: { type: 'Solid', color: '#fff' },
          textColor: '#222',
        },
        grid: {
          vertLines: { color: '#eee' },
          horzLines: { color: '#eee' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: '#ccc',
        },
      });
      
      // Check if chart was created successfully
      if (!chartRef.current) {
        console.error('Chart was not created');
        return;
      }
      
      // Add historical data series (solid line)
      if (Array.isArray(historicalData) && historicalData.length > 0) {
        historicalSeriesRef.current = chartRef.current.addSeries(LineSeries, { 
          color: '#2962FF',
          lineWidth: 2,
          title: 'Historical Price'
        });
        
        const formattedHistoricalData = historicalData.map(item => ({
          time: item.time,
          value: parseFloat(item.value)
        }));
        
        console.log('Setting historical data:', formattedHistoricalData);
        historicalSeriesRef.current.setData(formattedHistoricalData);
      }
      
      // Add forecast data series (dashed line)
      if (Array.isArray(forecastData) && forecastData.length > 0) {
        forecastSeriesRef.current = chartRef.current.addSeries(LineSeries, { 
          color: '#FF6B6B',
          lineWidth: 2,
          lineStyle: 1, // Dashed line
          title: 'Predicted Price'
        });
        
        const formattedForecastData = forecastData.map(item => ({
          time: item.time,
          value: parseFloat(item.value)
        }));
        
        console.log('Setting forecast data:', formattedForecastData);
        forecastSeriesRef.current.setData(formattedForecastData);
      }
      
      // Fit content to show all data
      chartRef.current.timeScale().fitContent();
      
      // Responsive resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }, [historicalData, forecastData, height]);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: '100%', height, minHeight: 200 }}
    />
  );
};

export default LightweightForecastChart; 