import syncDualAxesLayout from "./syncDualAxesLayout";

const createView = () => {
  const events = {};
  return {
    events,
    on: jest.fn((name, handler) => {
      events[name] = handler;
    }),
  };
};
const createChart = () => {
  const events = {};
  return {
    events,
    views: [createView(), createView()],
    on: jest.fn((name, handler) => {
      events[name] = handler;
    }),
    render: jest.fn(),
  };
};

test("a slider subview redraw triggers a shared parent layout pass", () => {
  const chart = createChart();
  syncDualAxesLayout({ chart });
  expect(chart.render).toHaveBeenCalledWith(true);
  chart.views[1].events.afterrender();
  expect(chart.render).toHaveBeenCalledTimes(2);
  syncDualAxesLayout({ chart });
  expect(chart.views[0].on).toHaveBeenCalledTimes(1);
});

test("replacement views after data updates also receive the layout fix", () => {
  const chart = createChart();
  syncDualAxesLayout({ chart });
  chart.views = [createView(), createView()];
  chart.events.beforepaint();
  chart.events.beforepaint();
  expect(chart.views[0].on).toHaveBeenCalledTimes(1);
  chart.views[0].events.afterrender();
  expect(chart.render).toHaveBeenCalledTimes(2);
});

test("nested render events and destroyed charts do not loop or redraw", () => {
  const chart = createChart();
  chart.render.mockImplementation(() => chart.views[0].events.afterrender());
  syncDualAxesLayout({ chart });
  expect(chart.render).toHaveBeenCalledTimes(1);
  chart.destroyed = true;
  chart.views[0].events.afterrender();
  expect(chart.render).toHaveBeenCalledTimes(1);
});
