// @ts-nocheck
import React, { useState, useEffect } from 'react'; // ✅ Fixed import
import AxiosInstance from './Axios';
import MyPieChart from './charts/PieChart';
import MyChartBox from './charts/ChartBox';
import StoreIcon from '@mui/icons-material/Store';
import MyDonutChart from './charts/DonutChart';
import WcIcon from '@mui/icons-material/Wc';
import MyStackedBarChart from './charts/StackedBarChart';
import CategoryIcon from '@mui/icons-material/Category';
import MyChartBox2 from './charts/ChartBox2';
import MyLineChart from './charts/LineChart';
import PublicIcon from '@mui/icons-material/Public';
import MyCombiChart from './charts/CombiChart';

const Dashboard1 = () => {
  const [myBrancheData, setMyBrancheData] = useState([]);
  const [myGenderData, setMyGenderData] = useState([]);
  const [MyProductBrancheData, setMyProductBrancheData] = useState([]);
  const [myCountryData, setMyCountryData] = useState([]);

  const GetData = () => {
    AxiosInstance.get('branchedata/')
      .then((res) => setMyBrancheData(res.data));
    AxiosInstance.get('genderdata/')
      .then((res) => setMyGenderData(res.data));
    AxiosInstance.get('productbranchedata/')
      .then((res) => setMyProductBrancheData(res.data));
    AxiosInstance.get('countrydata/')
      .then((res) => setMyCountryData(res.data));
  };

  useEffect(() => {
    GetData();
  }, []);

  // Only render charts when their data is ready
  const hasProductBrancheData = MyProductBrancheData.length > 0;
  const hasCountryData = myCountryData.length > 0;

  // Series configs (safe to define inline since they're static)
  const myseries = [
    { dataKey: 'quantityBrancheA', label: 'Branche A', stack: "A" },
    { dataKey: 'quantityBrancheB', label: 'Branche B', stack: "A" },
    { dataKey: 'quantityBrancheC', label: 'Branche C', stack: "A" },
  ];
  

  const mycountryseries = [
    { dataKey: 'quantityNetherlands', label: 'Netherlands' },
    { dataKey: 'quantityGermany', label: 'Germany' },
    { dataKey: 'quantityFrance', label: 'France' },
  ];

  const myproductbrancheseries = [
    { dataKey: 'quantityBrancheA', label: 'Branche A', type: 'bar' },
    { dataKey: 'quantityBrancheB', label: 'Branche B', type: 'line' },
    { dataKey: 'quantityBrancheC', label: 'Branche C', type: 'line' },
  ];

  // Safe total calculation
  const genderTotal = myGenderData.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div>
      {/* First row: only show when branch/gender data exists */}
      {(myBrancheData.length > 0 || myGenderData.length > 0 || hasProductBrancheData) && (
        <MyChartBox
          icon1={<StoreIcon />}
          title1={"Quantities per Branch"}
          chart1={<MyPieChart myData={myBrancheData} />}

          icon2={<WcIcon />}
          title2={"Quantities per Gender"}
          chart2={<MyDonutChart data={myGenderData} centerlabel={genderTotal} />}

          icon3={<CategoryIcon />}
          title3={"Quantities per Productline & Branche"}
          chart3={
            hasProductBrancheData ? (
              <MyStackedBarChart
                dataset={MyProductBrancheData}
                XlabelName={'productline__name'}
                series={myseries}
              />
            ) : null
          }
        />
      )}

      {/* Second row: only show when country or product data exists */}
      {(hasCountryData || hasProductBrancheData) && (
        <MyChartBox2
          icon1={<PublicIcon />}
          title1={"Quantities per Month per Country"}
          chart1={
            hasCountryData ? (
              <MyLineChart
                mydata={myCountryData}
                myxaxis={"month_name"}
                myseries={mycountryseries}
              />
            ) : null
          }

          icon2={<PublicIcon />}
          title2={"Quantities per Product Line per Branch"}
          chart2={
            hasProductBrancheData ? (
              <MyCombiChart
                data={MyProductBrancheData}
                myseries={myproductbrancheseries}
                xcolumn={'productline__name'}
              />
            ) : null
          }
        />
      )}

      {/* Optional: loading state */}
      {!hasProductBrancheData && !hasCountryData && myBrancheData.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Loading dashboard data...
        </div>
      )}
    </div>
  );
};

export default Dashboard1;