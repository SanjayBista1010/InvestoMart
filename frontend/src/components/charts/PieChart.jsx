import { PieChart, Pie, Cell, Legend, Tooltip, Sector } from 'recharts';
import { useState } from 'react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percentage } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  const displayValue = percentage !== undefined ? `${percentage}%` : value;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-sm font-semibold">
        {displayValue}
      </text>
    </g>
  );
};

const renderLabel = (entry) => {
  if (entry.percentage !== undefined) {
    return `${entry.percentage}%`;
  }
  return `${entry.value}`;
};

export default function MyPieChart({myData}) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!myData || myData.length === 0) {
    return <div className="w-full flex items-center justify-center text-gray-500">No data available</div>;
  }

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="w-full flex items-center justify-center">
      <PieChart width={450} height={280}>
        <Pie
          data={myData}
          cx={225}
          cy={130}
          labelLine={true}
          label={renderLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="label"
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
        >
          {myData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]}
              opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
              className="transition-opacity duration-300"
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
