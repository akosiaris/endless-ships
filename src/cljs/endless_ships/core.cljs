(ns endless-ships.core
  (:require [reagent.core :as ra]
            [re-frame.core :as rf]
            [endless-ships.events :as events]
            [endless-ships.views :as views]
            endless-ships.routes))

(defn render []
  (ra/render [views/interface]
             (js/document.getElementById "root")))

(defn init []
  (rf/dispatch-sync [::events/initialize])
  (render))