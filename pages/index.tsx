// pages/index.tsx
import { useState } from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Next Maps App</title>
        <meta name="description" content="Next.js application with Google Maps" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <Navigation />
        <div className="content">
          <h1>Welcome to the Maps Application</h1>
          <p>This application displays survey responses on a Google Map.</p>
          <Link href="/map">
            <button className={styles.button}>View Map</button>
          </Link>
        </div>
      </main>
    </div>
  );
}