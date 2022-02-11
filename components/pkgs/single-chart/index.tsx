import React, { useState, useEffect } from 'react';
import moment from 'moment';
import LineChart, { LineChartProps } from './LineChart';
import PieChart, { PieChartProps } from './PieChart';
import EnlargedChart from './EnlargedChart';
import { Spin } from '../../index';
// import { post, request } from '../../utils/request'
function Chart(
  props: (LineChartProps & PieChartProps & {
    chartTypeProp?: "singleLine" | "multLine" | "pie" | "label"
  })
) {
  const { propParams, url, reqCallback, requestMethod, resCallback, propChartData = null, showLargeChart, request, chartTypeProp = "singleLine" , ...rest } = props;
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [requestParams, setRequestParams] = useState<any>(null);
  const [chartType, setChartType] = useState<string>(chartTypeProp);

  const getChartData = async (variableParams?: any) => {
    try {
      setLoading(true);
      const mergeParams = {
        ...propParams,
        ...variableParams,
      };
      const params = reqCallback ? reqCallback(mergeParams) : mergeParams;
      setRequestParams(params);
      const res = await request(url, params);
      if (res) {
        const { data, type } = resCallback ? resCallback(res) : res;
        setChartData({
          data, 
          type
        });
        setChartType(type);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderRightHeader = () => {
    return (
      showLargeChart && <EnlargedChart
        {...props}
        onSave={(arg) => {
          getChartData({
            ...requestParams,
            ...arg
          });
        }}
        requestParams={requestParams}
      ></EnlargedChart>
    );
  };

  const refreshData = (variableParams, isClearLocalSort) => {
    if (isClearLocalSort && props.connectEventName) {
      localStorage.removeItem('$ConnectChartsSortTypeData');
    }
    getChartData(variableParams);
  };

  const renderContent = () => {
    if (chartType === 'pie') {
      return <PieChart {...rest}></PieChart>;
    }

    if (chartType === 'singleLine' || chartType === 'multLine') {
      return <LineChart {...rest} propChartData={chartData} refreshData={refreshData} renderRightHeader={renderRightHeader}></LineChart>;
    }

    return (
      <div>
        <div className="single-label-header">
          <div className="header-title">{props.title}</div>
        </div>
        <div className="single-label-content">
          <p className='single-label-content-time'>{moment(chartData).format('YYYY-MM-DD')}</p>
          <p className='single-label-content-date'>{moment(chartData).format('HH:mm')}</p>
        </div>
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      <div
        style={{
          ...props.wrapStyle,
          position: 'relative',
          width: '100%',
          opacity: loading ? 0 : 1,
        }}
      >
        {renderContent()}
      </div>
    </Spin>
  );
}

Chart.LineChart = LineChart;
Chart.PieChart = PieChart;

export default Chart;
