"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
  navigationMenuTriggerStyle2,
} from "@/components/ui/navigation-menu";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";

export default function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-row items-center justify-between p-2 px-4 sm:px-8 pt-4">
      <div className="flex flex-row items-center">
        <div className="hidden sm:block max-w-[35px]">
          <Image
            src="/smile.svg"
            alt="smile"
            width={100}
            height={100}
            sizes="100vw"
          />
        </div>
        <div className="flex items-center font-Patua text-xl font-bold ml-2">
          <Link href={"/"}>Planaway</Link>
        </div>
      </div>
      <div className="hidden sm:block">
        <NavigationMenu>
          <NavigationMenuList className="flex space-x-4">
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/"
                className={navigationMenuTriggerStyle()}
              >
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/login"
                className={navigationMenuTriggerStyle()}
              >
                Login
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/signUp"
                className={navigationMenuTriggerStyle2()}
              >
                Sign Up
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="sm:hidden">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Menu className="h-6 w-6" />
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Edit profile</DrawerTitle>
              <DrawerDescription>
                Make changes to your profile here. Click save when you&aposre
                done.
              </DrawerDescription>
            </DrawerHeader>

            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
