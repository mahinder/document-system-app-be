import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Doc extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  filePath: string;
}

export const DocumentSchema = SchemaFactory.createForClass(Doc);
