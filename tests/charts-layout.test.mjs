import test from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";
import syncDualAxesLayout from "../features/analytics/Components/Charts/syncDualAxesLayout.js";

const createView = () => {
  const events = {};
  return {
    events,
    on: mock.fn((name, handler) => { events[name] = handler; }),
  };
};

const createChart = () => {
  const events = {};
  return {
    events,
    views: [createView(), createView()],
    on: mock.fn((name, handler) => { events[name] = handler; }),
    render: mock.fn(),
  };
};

test("slider subview redraw synchronizes the parent layout exactly once", () => {
  const chart = createChart();
  syncDualAxesLayout({ chart });
  assert.equal(chart.render.mock.callCount(), 1);
  assert.deepEqual(chart.render.mock.calls[0].arguments, [true]);

  chart.views[1].events.afterrender();
  assert.equal(chart.render.mock.callCount(), 2);
  assert.deepEqual(chart.render.mock.calls[1].arguments, [true]);

  syncDualAxesLayout({ chart });
  assert.equal(chart.on.mock.callCount(), 1, "repeat initialization must not add a parent listener");
  assert.equal(chart.views[0].on.mock.callCount(), 1, "repeat initialization must not add a view listener");
  assert.equal(chart.render.mock.callCount(), 2, "repeat initialization must not redraw");
});

test("replacement views receive the layout fix after data updates", () => {
  const chart = createChart();
  syncDualAxesLayout({ chart });
  const oldViews = chart.views;
  chart.views = [createView(), createView()];

  chart.events.beforepaint();
  chart.events.beforepaint();
  for (const view of [...oldViews, ...chart.views]) {
    assert.equal(view.on.mock.callCount(), 1, "each view should receive one synchronization listener");
  }
  chart.views[0].events.afterrender();
  assert.equal(chart.render.mock.callCount(), 2);
  assert.deepEqual(chart.render.mock.calls[1].arguments, [true]);
});

test("nested render events and destroyed charts do not loop or redraw", () => {
  const chart = createChart();
  chart.render.mock.mockImplementation(() => chart.views[0].events.afterrender());
  syncDualAxesLayout({ chart });
  assert.equal(chart.render.mock.callCount(), 1, "nested afterrender must not recurse");

  chart.destroyed = true;
  chart.views[0].events.afterrender();
  assert.equal(chart.render.mock.callCount(), 1, "destroyed chart must not render");
});
