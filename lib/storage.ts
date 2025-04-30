import { User } from "./services/user.service";
import fs from "fs";

export class Storage {

  static async decrementUserConversions(userId: number): Promise<boolean> {
    const user = await User.findOne({id: userId});
    if (!user) {
      return false;
    }
    
    if (user.isPro) {
      return true; // Pro users have unlimited conversions
    }
    
    if (user.dailyConversionsRemaining <= 0) {
      return false; // No conversions remaining
    }
    
    await user.update(userId, {
      dailyConversionsRemaining: user.dailyConversionsRemaining - 1
    });
    
    return true;
  }

 static async cleanupFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error cleaning up file:", error);
  }
  };
  // // Conversion operations
  // static async createConversion(conversionData: InsertConversion): Promise<Conversion> {
  //   const now = new Date();
  //   const id = this.conversionIdCounter++;
  //   const conversion: Conversion = {
  //     id,
  //     ...conversionData,
  //     createdAt: now
  //   };
  //   this.conversions.set(id, conversion);
  //   return conversion;
  // }
}