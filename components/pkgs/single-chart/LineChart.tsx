import React, { useRef, useEffect, useState } from "react";
import _ from "lodash";
import * as echarts from "echarts";
import { getMergeOption, chartTypeEnum } from "./config";
import { Spin, Empty } from "../../index";
import { post, request } from '../../utils/request'
import './style/index.less'

interface Opts {
  width?: number;
  height?: number;
  theme?: Record<string, any>;
}

export type LineChartProps = {
  key?: any;
  // chartKey 在多个图表联动的时候必须传入
  chartKey?: string;
  title?: string;
  eventBus?: any;
  url?: string;
  request?: Function;
  requestMethod?: "get" | "post";
  propParams?: any;
  propChartData?: any;
  optionMergeProps?: {
    notMerge?: boolean;
    replaceMerge?: string[];
    lazyUpdate?: boolean;
    silent?: boolean;
  };
  reqCallback?: Function;
  resCallback?: Function;
  xAxisCallback?: Function;
  legendCallback?: Function;
  seriesCallback?: Function;
  option?: any;
  wrapStyle: React.CSSProperties;
  wrapClassName?: string;
  initOpts?: Opts;
  getChartInstance?: (instance: echarts.ECharts) => void;
  onResize?: (params: any) => void;
  resizeWait?: number;
  onEvents?: Record<string, Function>;
  showLargeChart?: boolean;
  connectEventName?: string;
  renderRightHeader?: Function;
  curXAxisData?: any;
  showHeader?: boolean;
};

export const LineChart = (props: LineChartProps) => {
  const {
    key,
    chartKey,
    title,
    url,
    propParams,
    requestMethod = 'post',
    reqCallback,
    resCallback,
    xAxisCallback,
    legendCallback,
    seriesCallback,
    eventBus,
    onEvents,
    wrapStyle,
    option,
    wrapClassName = "",
    initOpts,
    getChartInstance,
    onResize,
    resizeWait = 1000,
    connectEventName = "",
    propChartData = null,
    optionMergeProps = {},
    renderRightHeader,
    curXAxisData,
    showHeader
  } = props;

  const [chartData, setChartData] = useState<Record<string, any>>(propChartData);
  const [loading, setLoading] = useState<boolean>(false);
  const chartRef = useRef(null);
  const dragState = useRef(false);
  let [chartInstance, setChartInstance] = useState<echarts.ECharts>(null)

  let handleMouseMove: Function;
  let handleMouseOut: Function;

  const onRegisterConnect = ({ chartInstance, chartRef }) => {
    handleMouseMove = (e: any, chartKey: string) => {
      if (dragState.current) return;
      let result = chartInstance?.convertFromPixel(
        {
          seriesIndex: 0,
          xAxisIndex: 0,
        },
        [e.offsetX, e.offsetY]
      );
      // 判断超出图表范围就不展示 tooltip
      result.some(num => num < 0) ? handleMouseOut() : eventBus?.emit(connectEventName, {
        chartKey,
        result,
      });
    };

    handleMouseOut = () => {
      eventBus?.emit("mouseout");
    }

    eventBus?.on(connectEventName, ({ chartKey: curChartKey, result }) => {
      if (chartKey !== curChartKey && result) {
        chartInstance?.dispatchAction({
          type: "showTip",
          seriesIndex: 0,
          dataIndex: result[0],
        });
        chartInstance?.setOption({
          tooltip: {
            axisPointer: {
              type: "line",
            },
          },
        });
      }
    });

    chartRef?.current?.addEventListener("mousemove", (e) => handleMouseMove(e, chartKey));

    eventBus?.on("mouseout", (curChartKey) => {
      if (chartKey === curChartKey) return;

      chartInstance?.dispatchAction({
        type: "hideTip",
      });

      chartInstance?.setOption({
        tooltip: {
          axisPointer: {
            type: "none",
          },
        },
      });
    });

    // 拖拽事件
    eventBus?.on("onDrag", (state) => {
      dragState.current = state
    })

    chartRef?.current?.addEventListener("mouseout", () => handleMouseOut(chartKey));
  };

  const onDestroyConnect = ({ chartRef }) => {
    eventBus?.removeAll(connectEventName);
    eventBus?.removeAll("mouseout");
    eventBus?.removeAll("onDrag");
    chartRef?.current?.removeEventListener("mousemove", handleMouseMove);
    chartRef?.current?.removeEventListener("mouseout", handleMouseOut);
  };

  // 初始化图表，绑定相关事件
  const initChart = () => {
    const instance = echarts.init(chartRef.current, initOpts?.theme, {
      width: initOpts?.width || undefined,
      height: initOpts?.height || undefined,
    });
    bindEvents(instance, onEvents || {});
    setChartInstance(instance)
    connectEventName && onRegisterConnect?.({
      chartInstance: instance,
      chartRef,
    });
    getChartInstance?.(instance);
    return instance
  }

  const renderChart = () => {
    if (!chartData) return;

    const instance = chartInstance || initChart()
    const chartOptions = getOptions();
    instance.setOption(chartOptions, optionMergeProps);
  };

  const getOptions = () => {
    const xAxisData = xAxisCallback?.(chartData);
    const legendData = legendCallback?.(chartData);
    const seriesData = seriesCallback ? seriesCallback(chartData) : chartData;
    const chartOptons = getMergeOption(chartTypeEnum.line, {
      ...option,
      xAxisData,
      legendData,
      seriesData,
    });
    return chartOptons;
  };

  const renderHeader = () => {
    return <div className="single-chart-header">
      <div className="header-title">{title}</div>
      <div className="header-right">
        {renderRightHeader?.()}
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

  // const handleData = (variableParams, isClearLocalSort) => {
  //   if(isClearLocalSort && connectEventName) {  
  //     localStorage.removeItem("$ConnectChartsSortTypeData");
  //   }
  //   getChartData(variableParams);
  // }

  const getChartData = async (variableParams?: any) => {
     if(propChartData) {
      return;
    };    
    try {
      setLoading(true);
      const mergeParams = {
        ...propParams,
        ...variableParams
      }
      // setRequestParams(mergeParams);
      const params = reqCallback ? reqCallback(mergeParams) : mergeParams;
      const res = requestMethod === "post" ? await post(url, params) : request(url, { params });
      // const res = await props.request?.(url, params);
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

  const handleChartResize = () => {
    setLoading(true);
    setTimeout(() => {
      chartInstance?.resize();
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    eventBus?.on('singleReload', getChartData);
    return () => {
      eventBus?.removeAll('singleReload');
      connectEventName && onDestroyConnect?.({
        chartRef,
      });
    };
  }, [eventBus]);

  useEffect(() => {
    if (chartInstance) {
      (handleChartResize as any).type = title
      eventBus?.on('chartResize', handleChartResize);
    }
  }, [chartInstance]);

  useEffect(() => {
    renderChart();
  }, [chartData]);

  useEffect(() => {
    if(curXAxisData) {
      const handle = () => {
        eventBus?.emit('stayCurXAxis')
      };
      chartRef?.current?.addEventListener("mouseout", handle);
  
      eventBus?.on("stayCurXAxis", () => {
        chartInstance?.dispatchAction({
          type: "showTip",
          seriesIndex: 0,
          dataIndex: curXAxisData.index,
        });
        chartInstance?.setOption({
          tooltip: {
            axisPointer: {
              type: "line",
            },
          },
        });
      });
      return () => {
        chartRef?.current?.removeEventListener("mouseout", handle);
        eventBus?.removeAll('stayCurXAxis')
      };
    };
  }, [chartInstance, chartRef, curXAxisData]);

  useEffect(() => {
    setChartData(propChartData);
  }, [propChartData]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [chartInstance, initOpts, onResize]);

  return (
    <Spin spinning={loading}>
      {chartData ? (
        <div style={{
            ...wrapStyle,
            position: "relative",
            width: "100%",
            opacity: loading ? 0 : 1,
        }}>
          {(showHeader === undefined || showHeader) && renderHeader()}
          <div
            ref={chartRef}
            className={wrapClassName}
            style={wrapStyle}
          ></div>
        </div>
      ) : (
        <div
          style={{
            ...wrapStyle,
            position: "relative",
            opacity: loading ? 0 : 1,
          }}
        >
          {(showHeader === undefined || showHeader) && renderHeader()}
          <Empty
            description="数据为空~"
            image={Empty.PRESENTED_IMAGE_CUSTOM}
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

export default LineChart;