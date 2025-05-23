"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, ImageIcon, Palette, Sparkles } from "lucide-react";
import Link from "next/link";

import styles from "@/components/home-page.module.css";
export default function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundImage: 'url("/Grid-Layout.svg")', backgroundSize: 'cover',       
    backgroundRepeat: 'no-repeat', 
    backgroundPosition: 'center' }}
    >
      {/* Hero Section */}
      

      <div className={styles.main}>
        <div className={styles.heroSection}>
          <div>
            <img
              src="/generate.png" 
              alt="Background"
              style={{ marginBottom: "45vh" }}
            />
          </div>

          <div className={styles.effectContainer}>
            <div className={styles.container}>
              <img
                src="/effectsimg.svg"
                alt="Background"
                className={styles.backgroundVideo}
              />

              <div className={styles.contentOverlay}>
                <h1 className={styles.mainHeading}>
                  Create Stunning Color Palettes in Seconds
                </h1>

                <p className={styles.description}>
                  Get AI-powered color suggestions instantly. With
                  just a click, transform your ideas into vibrant color schemes
                  effortlessly.
                </p>

                <div className={styles.features}>
                  <div className={styles.featureItem}>
                    <h2 className="font-medium">Fast & Easy</h2>
                    <p>
                      Generate unique palettes tailored to your project's mood
                      and theme in moments.
                    </p>
                  </div>

                  <div className={styles.featureItem}>
                    <h2 className="font-medium">Endless Inspiration</h2>
                    <p>
                      Explore trending palettes and remix them to fit your
                      creative vision.
                    </p>
                  </div>
                </div>

               <Link href="/palette-generator">
              <button className={styles.generateButton}>
                Start Generating
                <ArrowRight className={styles.buttonIcon} />
              </button>
            </Link>
              </div>
            </div>
          </div>
          <div className={styles.generate}>
            <img
              src="/explore.png" 
              alt="Background"
              style={{ marginTop: "45vh" }}
            />
          </div>
        </div>

        {/* How It Works Section */}
        <div style={{backgroundColor:'white', border:'1px solid Black', borderRadius:'20px', marginTop:'5rem',marginRight:'auto',marginLeft:'auto', padding:'2rem', width:'80%'}}>
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-4">
              How It Works
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Creating the perfect color palette has never been easier. Follow
              these simple steps:
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Choose Your Method
                </h3>
                <p className="text-gray-600">
                  Generate a random palette or upload an image to extract
                  colors.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-pink-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Customize</h3>
                <p className="text-gray-600">
               Fine tune your palette and download it.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Export & Use</h3>
                <p className="text-gray-600">
                  Copy your palette and use it in your designs, websites, or
                  apps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
