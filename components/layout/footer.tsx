import React from 'react';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          {/* <Icons.logo /> */} {/* TODO: Add Logo */}
          <p className="text-center text-sm leading-loose md:text-left text-muted-foreground">
            Built by Cline. The source code is available on GitHub (TODO: Add link).
          </p>
        </div>
        {/* TODO: Add social links or other footer content */}
        <p className="text-center text-sm md:text-left text-muted-foreground">
          © {new Date().getFullYear()} Cigar Accessories, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
