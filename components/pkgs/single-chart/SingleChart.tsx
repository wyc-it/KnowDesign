import React, { useRef, useEffect, useState } from "react";
import _ from "lodash";
import * as echarts from "echarts";
import { getMergeOption } from "./config";
import { Spin, Empty } from "../../index";
import EnlargedChart from './EnlargedChart';
import { post } from '../../utils/request'

import './style/index.less'

interface Opts {
  width?: number;
  height?: number;
  theme?: Record<string, any>;
}

export type SingleChartProps = {
  chartType?: string;
  title?: string;
  eventBus?: any;
  url?: string;
  request?: Function;
  propsParams?: any;
  reqCallback?: Function;
  resCallback?: Function;
  xAxisCallback?: Function;
  legendCallback?: Function;
  seriesCallback?: Function;
  option: any;
  wrapStyle: React.CSSProperties;
  wrapClassName?: string;
  initOpts?: Opts;
  onResize?: (params: any) => void;
  resizeWait?: number;
  onEvents?: Record<string, Function>;
  onMount?: (params?: any) => void;
  onUnmount?: (params?: any) => void;
  showLargeChart?: boolean;
};

export const SingleChart = (props: SingleChartProps) => {
  const {
    title,
    url,
    propsParams,
    request,
    reqCallback,
    resCallback,
    xAxisCallback,
    legendCallback,
    seriesCallback,
    eventBus,
    onEvents,
    onMount,
    onUnmount,
    wrapStyle,
    option,
    wrapClassName = "",
    initOpts,
    onResize,
    resizeWait = 1000,
    chartType,
  } = props;

  const [chartData, setChartData] = useState<Record<string, any>>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [requestParams, setRequestParams] = useState<any>(null);
  const chartRef = useRef(null);
  let chartInstance = null;

  const renderChart = async () => {
    if (!chartData) {
      return;
    }

    const chartOptions = getOptions();
    const renderedInstance = echarts.getInstanceByDom(chartRef.current);
    if (renderedInstance) {
      chartInstance = renderedInstance;
    } else {
      chartInstance = echarts.init(chartRef.current, initOpts?.theme, {
        width: initOpts?.width || undefined,
        height: initOpts?.height || undefined,
      });
    };

    bindEvents(chartInstance, onEvents || {});

    chartInstance.setOption(chartOptions);
    onMount?.({
      chartInstance,
      chartRef,
    });
  };

  const getOptions = () => {
    const xAxisData = xAxisCallback?.(chartData);
    const legendData = legendCallback?.(chartData);
    const seriesData = seriesCallback ? seriesCallback(chartData) : chartData;
    const chartOptons = getMergeOption(chartType, {
      ...option,
      xAxisData,
      legendData,
      seriesData
    });

    return chartOptons;
  };

  const renderHeader = () => {
    const { showLargeChart, ...rest } = props;
    return <div className="single-chart-header">
      <div className="header-title">{title}</div>
      <div className="header-right">
        {showLargeChart && <EnlargedChart {...rest} showLargeChart={false} requestParams={requestParams}></EnlargedChart>}
      </div>
    </div>
  };

  const bindEvents = (instance: any, events: any) => {
    const _bindEvent = (eventName: string, func: Function) => {
      if (typeof eventName === "string" && typeof func === "function") {
        instance.on(eventName, (params) => {
          func(params, instance);
        });
      }
    };

    for (const eventName in events) {
      if (Object.prototype.hasOwnProperty.call(events, eventName)) {
        _bindEvent(eventName, events[eventName]);
      }
    }
  };

  const getChartData = async (variableParams?: any) => {
    try {
      setLoading(true);
      const mergeParams = {
        ...propsParams,
        ...variableParams
      }
      const params = reqCallback ? reqCallback(mergeParams) : mergeParams;
      console.log(params, 'params');
      setRequestParams(params);
      const res = await request(url, params);
      // const res = await post(url, params);
      
      if (res) {
        const data = resCallback ? resCallback(res): res;
        setChartData(data);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResize = _.throttle(() => {
    chartInstance?.resize({
      width: initOpts?.width || undefined,
      height: initOpts?.height || undefined,
    });
    onResize?.(chartInstance);
  }, resizeWait);

  useEffect(() => {
    // console.log(propsParams?.code, 'init');
    
    eventBus?.on('chartInit', getChartData);

    eventBus?.on('chartReload', getChartData);

    eventBus?.on('singleReload', getChartData);

    return () => {
      onUnmount?.({
        chartInstance,
        chartRef,
      });
    };
  }, []);

  useEffect(() => {
    eventBus?.on('chartResize', () => {
      setLoading(true);
      setTimeout(() => {
        chartInstance?.resize();
        setLoading(false);
      }, 500);
    });
  })

  useEffect(() => {
    renderChart();
  }, [chartData]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      // chartInstance && chartInstance.dispose();
    };
  }, [chartData, option]);

  return (
    <Spin spinning={loading}>
      {chartData ? (
        <div className="single-chart-container" style={{
          opacity: loading ? 0 : 1,
        }}>
          {renderHeader()}
          <div
            ref={chartRef}
            className={wrapClassName}
            style={wrapStyle}
          ></div>
        </div>
      ) : (
        <div
          className="single-chart-container"
          style={{
            ...wrapStyle,
            position: "relative",
            opacity: loading ? 0 : 1,
          }}
        >
          {renderHeader()}
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      )}
    </Spin>
  );
};

export default SingleChart;
