from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Role, UserProfile


def assign_admin_role_if_needed(user):
    profile, _ = UserProfile.objects.get_or_create(user=user)

    if profile.role_id:
        return

    if not (user.is_staff or user.is_superuser):
        return

    admin_role = Role.objects.filter(name='Admin').first()
    if not admin_role:
        return

    profile.role = admin_role
    profile.save(update_fields=['role'])

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

    assign_admin_role_if_needed(instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    profile, _ = UserProfile.objects.get_or_create(user=instance)
    profile.save()
    assign_admin_role_if_needed(instance)