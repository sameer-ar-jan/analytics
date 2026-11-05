"use client";

import React, { useEffect, useMemo, useState } from "react";
import SelectLabels from "../Select";
import SimpleTabs from "../TabPanel/TabPanel";
import { buildEventChartData } from "./eventChartData";
import SimpleTabsModal from "../TabPanel/TabPanelModal";

export default function EventsChart(props) {
  const { itemGeo, setItemGeo } = props;
  const [itemExp, setItemExp] = useState("");
  const { geo, experiments, selectedGeo, selectedExperiment, graphdata } = useMemo(
    () => buildEventChartData({
      data: props.data, dataGeo: props.dataGeo, dataGeolist: props.dataGeolist,
      itemGeo: props.itemGeo, itemExp, start: props.start, end: props.end,
    }),
    [props.data, props.dataGeo, props.dataGeolist, props.itemGeo, itemExp, props.start, props.end],
  );
  useEffect(() => {
    if (itemGeo !== selectedGeo) setItemGeo(selectedGeo);
  }, [itemGeo, setItemGeo, selectedGeo]);

  return (
    <div style={{ height: "100%" }}>
      <>
        {!props.model ? (
          <SimpleTabs
            query={props.query}
            setLoading={props.setLoading}
            allData={[
              { name: "INT", value: graphdata.INT },
              { name: "RV", value: graphdata.RV },
              { name: "OOM", value: graphdata.OOM },
              { name: "BOR", value: graphdata.BOR },
              { name: "purchase", value: graphdata.purchase },
              { name: "Ad Impression", value: graphdata.AdImpression },
            ]}
            iap={true}
            events={true}
            select={
              <SelectLabels
                itemExp={selectedExperiment}
                setItemExp={setItemExp}
                itemGeo={selectedGeo}
                setItemGeo={props?.setItemGeo}
                experiments={experiments}
                geo={geo}
              />
            }
          />
        ) : (
          <SimpleTabsModal
            query={props.query}
            setLoading={props.setLoading}
            allData={[
              { name: "INT", value: graphdata.INT },
              { name: "RV", value: graphdata.RV },
              { name: "OOM", value: graphdata.OOM },
              { name: "BOR", value: graphdata.BOR },
              { name: "purchase", value: graphdata.purchase },
              { name: "Ad Impression", value: graphdata.AdImpression },
            ]}
            iap={true}
            events={true}
            select={
              <SelectLabels
                itemExp={selectedExperiment}
                setItemExp={setItemExp}
                itemGeo={selectedGeo}
                setItemGeo={props?.setItemGeo}
                experiments={experiments}
                geo={geo}
              />
            }
          />
        )}
      </>
    </div>
  );
}
