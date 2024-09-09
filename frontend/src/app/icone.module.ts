// icon.module.ts
import { NgModule } from '@angular/core';
import { LucideAngularModule, CalendarCheck, CalendarX2 } from 'lucide-angular';
@NgModule({
    imports: [
        LucideAngularModule.pick({ CalendarCheck }),
        LucideAngularModule.pick({ CalendarX2 }),
    ],
    exports: [LucideAngularModule], // Assurez-vous d'exporter LucideAngularModule
})
export class IconModule {}
