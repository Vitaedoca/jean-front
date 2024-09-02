"use client";

import React from "react";
import { Toaster } from "react-hot-toast";

// Definindo uma interface para as props
interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <>
      <Toaster />
      {children}
    </>
  );
};

export default Providers;
