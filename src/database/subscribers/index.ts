import { ChangeSetType, type EventSubscriber, type FlushEventArgs } from "@mikro-orm/core";

export class SoftDeleteSubscriber implements EventSubscriber {
    async onFlush(args: FlushEventArgs): Promise<void> {
        for (const changeSet of args.uow.getChangeSets()) {
            if (changeSet.type !== ChangeSetType.DELETE) {
                continue;
            }

            if (!changeSet.meta.properties.deletedAt) {
                continue;
            }

            changeSet.entity.deletedAt = new Date();
            args.uow.computeChangeSet(changeSet.entity, ChangeSetType.UPDATE);
        }
    }
}
