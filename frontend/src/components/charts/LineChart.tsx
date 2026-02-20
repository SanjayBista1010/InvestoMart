// @ts-nocheck
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export default function MyLineChart({ mydata, myxaxis, myseries }) {
  return (
    <div className="w-full flex items-center justify-center">
      <LineChart
        width={700}
        height={300}
        data={mydata}
        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300" />
        <XAxis 
          dataKey={myxaxis} 
          className="text-xs"
          angle={-20}
          textAnchor="end"
          height={60}
        />
        <YAxis className="text-xs" />
        <Tooltip 
          contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
          wrapperClassName="rounded-lg shadow-lg"
        />
        <Legend />
        {myseries.map((series, index) => (
          <Line
            key={series.dataKey}
            type="monotone"
            dataKey={series.dataKey}
            name={series.label}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </div>
  );
}
