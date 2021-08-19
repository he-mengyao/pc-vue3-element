<template>
  <el-card class="box-card">
    <div ref="main" class="box"></div>
  </el-card>
</template>

<script lang="ts">
import api from "@/http/api";
import { defineComponent, onMounted, ref } from "vue";
import * as echarts from "echarts";

export default defineComponent({
  setup() {
    const main = ref<HTMLElement | null>(null);
    let getData = () => {
      api
        .getReports()
        .then((res: any) => {
          if (res.meta.status === 200) {
            // 折线图
            if (main.value) {
              let myChart = echarts.init(main.value);
              let option;
              option = {
                color: ["#b34038", "#334553", "#6f9fa7", "#cb8a70", "#9cc5b0"],
                tooltip: {
                  trigger: "axis",
                  axisPointer: {
                    type: "cross",
                    label: {
                      backgroundColor: "#6a7985",
                    },
                  },
                },
                legend: {
                  data: res.data.legend.data,
                },
                grid: {
                  left: "3%",
                  right: "4%",
                  bottom: "3%",
                  containLabel: true,
                },
                xAxis: [
                  {
                    type: "category",
                    boundaryGap: true,
                    data: res.data.xAxis[0].data,
                  },
                ],
                yAxis: [
                  {
                    type: "value",
                  },
                ],
                series: res.data.series,
              };
              option && myChart.setOption(option);
            }
          }
        })
        .catch(() => {
          console.log("折线图数据请求失败");
        });
    };
    onMounted(() => {
      getData();
    });
    return {
      main,
    };
  },
});
</script>

<style scoped>
.box {
  height: 400px;
  width: 100%;
}
</style>