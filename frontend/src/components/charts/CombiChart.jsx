import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export default function MyCombiChart({data, myseries, xcolumn}) {
  return (
    <div className="w-full flex items-center justify-center">
      <ComposedChart
        width={700}
        height={300}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300" />
        <XAxis 
          dataKey={xcolumn}
          angle={-20}
          textAnchor="end"
          height={60}
          className="text-xs"
        />
        <YAxis className="text-xs" />
        <Tooltip 
          contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
          wrapperClassName="rounded-lg shadow-lg"
        />
        <Legend />
        {myseries.map((s, index) => {
          if (s.type === 'bar') {
            return (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.label}
                fill={COLORS[index % COLORS.length]}
              />
            );
          } else {
            return (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.label}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            );
          }
        })}
      </ComposedChart>
    </div>
  );
}
