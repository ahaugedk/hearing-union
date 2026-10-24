import { z } from 'zod';
export const eventArgumentsSchema = z.object({
  topicIds: z.array(z.string().min(1).max(200)).max(50).optional(),
  regions: z.array(z.string().min(1).max(200)).max(50).optional(),
  format: z.enum(['any','physical','online']).optional(),
}).strict();
const callback = z.string().url().max(2000);
export const subscribeSchema = z.object({
  name: z.literal('lecture.relevant_published'), arguments: eventArgumentsSchema.optional(),
  delivery: z.object({mode:z.literal('webhook'),url:callback,secret:z.string().min(1).max(150)}).strict(),
  ttlMs: z.number().int().min(1).max(8.64e15).nullable().optional(), cursor:z.null().optional(),
}).strict();
export const unsubscribeSchema = z.object({
  name:z.literal('lecture.relevant_published'),arguments:eventArgumentsSchema.optional(),
  delivery:z.object({mode:z.literal('webhook'),url:callback}).strict(),
}).strict();
export type SubscribeParams = z.infer<typeof subscribeSchema>;
export type UnsubscribeParams = z.infer<typeof unsubscribeSchema>;
export const lecturePublishedEvent = {
 name:'lecture.relevant_published', delivery:['webhook'],
 description:'Nyt relevant foredrag, som brugeren udtrykkeligt har bedt om at følge. Hent aktuelle detaljer med lecture_get; eventet tilmelder aldrig brugeren.',
 inputSchema:z.toJSONSchema(eventArgumentsSchema),
 payloadSchema:{type:'object',properties:{lectureId:{type:'string'},version:{type:'integer'},summary:{type:'string'}},required:['lectureId','version','summary'],additionalProperties:false},
};
