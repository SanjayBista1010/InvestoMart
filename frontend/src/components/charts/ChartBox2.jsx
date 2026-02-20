export default function MyChartBox2(props) {
  const {icon1, title1, chart1, icon2, title2, chart2} = props
  return (
    <div className="w-full flex flex-wrap shadow-lg justify-evenly mt-5">
      
      <div className="w-full sm:w-full md:w-1/2 lg:w-1/2 p-5 border-r border-dotted border-gray-300 flex flex-col">
        <div className="mb-5 font-bold flex flex-row items-center">
          <div className="mr-4">{icon1}</div>
          <div>{title1}</div>
        </div>
        <div className="flex-1 h-[350px]">{chart1}</div>
      </div>

      <div className="w-full sm:w-full md:w-1/2 lg:w-1/2 p-5 border-r border-dotted border-gray-300 flex flex-col">
        <div className="mb-5 font-bold flex flex-row items-center">
          <div className="mr-4">{icon2}</div>
          <div>{title2}</div>
        </div>
        <div className="flex-1 h-[350px]">{chart2}</div>
      </div>

    </div>
  );
}