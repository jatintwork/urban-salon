from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from base.models import UserRoleMapping
from company_services.models import Notification, ServiceRequest

def _create_notification(user, message, service_request):
    """A helper function to create and save a notification."""
    Notification.objects.create(
        user=user,
        message=message,
        service_request=service_request
    )

@receiver(pre_save, sender=ServiceRequest)
def cache_old_assigned_provider(sender, instance, **kwargs):
    """
    Before saving, cache the old assigned_provider if the instance already exists.
    """
    if instance.pk:
        try:
            instance._old_assigned_provider = sender.objects.get(pk=instance.pk).assigned_provider
        except sender.DoesNotExist:
            instance._old_assigned_provider = None
    else:
        instance._old_assigned_provider = None

@receiver(post_save, sender=ServiceRequest)
def service_request_notifications(sender, instance, created, **kwargs):
    """
    Handles notifications for ServiceRequest creation and assignment changes.
    """
    if created:
        # Notify client of creation
        _create_notification(
            instance.client,
            f"Your service request for '{instance.service.name}' has been created.",
            instance
        )
        # Notify all admins of creation
        admin_mappings = UserRoleMapping.objects.filter(role__name__iexact='admin', delete_flag=False)
        for mapping in admin_mappings:
            _create_notification(
                mapping.user,
                f"A new service request from {instance.client.username} for '{instance.service.name}' needs assignment.",
                instance
            )
    else:
        # On update, handle assignment/re-assignment
        old_provider = getattr(instance, '_old_assigned_provider', None)
        new_provider = instance.assigned_provider

        if new_provider != old_provider:
            # Notify previous provider of re-assignment (if one existed)
            if old_provider:
                _create_notification(
                    old_provider,
                    f"The request for '{instance.service.name}' has been reassigned from you.",
                    instance
                )

            # Notify new provider of assignment (if one exists)
            if new_provider:
                _create_notification(
                    new_provider,
                    f"You have been assigned a new service request: '{instance.service.name}'.",
                    instance
                )

            # Notify client of the assignment change
            message = (
                f"Provider {new_provider.username} has been assigned to your request for '{instance.service.name}'."
                if new_provider
                else f"The provider for your request '{instance.service.name}' has been unassigned."
            )
            _create_notification(instance.client, message, instance)

    # Place your logic here. For now, just print or log.
    print(f"ServiceRequest created: {instance}")
    # You can also send notifications, emails, etc. 