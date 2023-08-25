import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";

export default function Home() {
  const showcase = ["day1", "day2", "day3", "day4", "day5"];
  const router = useRouter();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
      }}
    >
      {showcase.map((day, index) => {
        return (
          <div
            key={index}
            onClick={() => {
              router.push(`/${day}`);
            }}
          >
            <iframe
              src={day}
              key={index}
              style={{
                pointerEvents: "none",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
