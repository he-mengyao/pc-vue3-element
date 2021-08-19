<template>
  <el-card class="box-card">
    <el-row>
      <el-col :span="8" class="mrr-10"
        ><el-input v-model="input" placeholder="请输入搜索内容" clearable>
          <template #append>
            <el-button
              icon="el-icon-search"
              @click="search(input)"
            ></el-button> </template></el-input
      ></el-col>
    </el-row>
    <div class="mrt-20"></div>
    <!-- 表格 -->
    <div class="table">
      <el-table :data="list" stripe style="width: 100%" border>
        <el-table-column type="index" width="80" label="#" align="center">
        </el-table-column>
        <el-table-column
          prop="order_number"
          label="订单编号"
          width="200"
          align="center"
        >
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格" align="center">
        </el-table-column>
        <el-table-column prop="pay_status" label="是否付款" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.pay_status === '0'" disable-transitions>
              未付款
            </el-tag>
            <el-tag
              v-else-if="scope.row.pay_status === '1'"
              type="danger"
              disable-transitions
              >已付款</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" align="center">
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间" align="center">
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="edit(scope.row, 1)"
              size="mini"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              @click="look(scope.row, 2)"
              size="mini"
            ></el-button>
          </template>
        </el-table-column>
        <el-row v-if="list.length === 0">暂无数据</el-row>
      </el-table>
      <!-- 分页 -->
      <div class="mrt-20">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagenum"
          :page-sizes="[5, 15, 20, 30]"
          :page-size="pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>
    <!-- 弹框 -->
    <el-dialog
      :title="num === 1 ? '编辑地址' : '物流信息'"
      v-model="dialogVisible1"
      width="40%"
      :show-close="true"
    >
      <el-cascader
        v-model="value"
        :options="proArr"
        :props="props"
        @change="handleChange"
        placeholder="请选择"
        style="width: 100%"
        v-if="num === 1"
      ></el-cascader>
      <!-- 物流显示 -->
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in stepList"
          :key="index"
          :timestamp="item.time"
        >
          {{ item.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </el-card>
</template>

<script lang="ts">
import api from "@/http/api";
import { defineComponent, ref, onMounted } from "vue";
import dayjs from "dayjs";
import axios from "axios";
import { areaList } from "@vant/area-data";

interface obj {
  consignee_addr: string;
  create_time: string;
  is_send: string;
  order_fapiao_company: string;
  order_fapiao_content: string;
  order_fapiao_title: "string";
  order_id: number;
  order_number: string;
  order_pay: string;
  order_price: number;
  pay_status: string;
  trade_no: string;
  update_time: number;
  user_id: number;
}
interface obj1 {
  context: string;
  ftime: string;
  location: null;
  time: string;
}
interface obj2 {
  value: number;
  label: string;
  children: [];
}

export default defineComponent({
  setup() {
    let query = ref<string>("");
    let pagenum = ref(1);
    let pagesize = ref(5);
    let total = ref(0);
    let input = ref("");
    let dialogVisible1 = ref(false);
    let value = ref([]);
    let num = ref(0);
    let stepList = ref<obj1[]>([]);
    let list = ref<obj[]>([]);
    // 城市处理
    let citys = areaList;
    let n1 = citys.province_list as any;
    let n2 = citys.city_list as any;
    let n3 = citys.county_list as any;
    let proArr = ref<any[]>([]);
    Object.keys(n1).map((i) => {
      let cityArr = ref<any[]>([]);
      Object.keys(n2).map((j) => {
        if (i.substr(0, 2) === j.substr(0, 2)) {
          let countyArr = ref<any[]>([]);
          Object.keys(n3).map((q) => {
            // 里层数据
            if (q.substr(0, 4) === j.substr(0, 4)) {
              let obj = ref<any>();
              obj.value = {
                value: q,
                label: n3[q],
              };
              countyArr.value.push(obj.value);
            }
          });
          cityArr.value.push({
            value: j,
            label: n2[j],
            children: countyArr.value,
          });
        }
      });
      proArr.value.push({
        value: i,
        label: n1[i],
        children: cityArr.value,
      });
    });
    let props = ref({ expandTrigger: "hover" });
    let getData = () => {
      api
        .getOrders({
          query: query.value,
          pagenum: pagenum.value,
          pagesize: pagesize.value,
        })
        .then((res: any) => {
          if (res.meta.status === 200) {
            list.value = res.data.goods;
            total.value = res.data.total;
            list.value.map((i) => {
              i.create_time = dayjs(i.create_time).format(
                "YYYY-MM-DD HH:mm:ss"
              );
            });
          }
        })
        .catch(() => {
          console.log("订单列表请求失败");
        });
    };
    // 获取物流信息
    let getKuaidi1 = () => {
      let token = localStorage.getItem("token");
      let id = ref(1106975712662);
      axios
        .get(
          `https://www.liulongbin.top:8888/api/private/v1/kuaidi/${id.value}`,
          {
            headers: { Authorization: token },
          }
        )
        .then((res: any) => {
          if (res.status === 200) {
            stepList.value = res.data.data;
          }
        })
        .catch(() => {
          console.log("物流请求失败");
        });
    };
    // 搜索
    let search = (value: string) => {
      // console.log(value);
    };
    // 分页
    const handleSizeChange = (val: number) => {
      // console.log(`每页 ${val} 条`);
      pagesize.value = val;
      getData();
    };
    const handleCurrentChange = (val: number) => {
      // console.log(`当前页: ${val}`);
      pagenum.value = val;
      getData();
    };
    // 编辑
    let edit = (row: obj, n: number) => {
      // console.log(row);
      dialogVisible1.value = true;
      num.value = n;
    };
    // 选择地址
    let handleChange = (val: string) => {
      console.log(val);
    };
    // 查看物流信息
    let look = (row: obj, n: number) => {
      // console.log(row);
      dialogVisible1.value = true;
      num.value = n;
      getKuaidi1();
    };
    onMounted(() => {
      getData();
    });
    return {
      input,
      pagenum,
      pagesize,
      search,
      list,
      total,
      handleSizeChange,
      handleCurrentChange,
      edit,
      dialogVisible1,
      value,
      handleChange,
      look,
      num,
      stepList,
      props,
      proArr,
    };
  },
});
</script>

<style scoped>
</style>