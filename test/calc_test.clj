(ns calc-test
  (:require [clojure.test :refer :all]
            [calc :as c]))

(deftest sum-test
  (is (= 3 (c/sum 1 2)))
  (is (= 3 (c/sum 2 1))))

(deftest multiply-test
  (is (= 2 (c/multiply 1 2)))
  (is (= 2 (c/multiply 2 1))))
