import * as React from 'react';
import classNames from 'classnames';
import { iconMap } from '../../svgs';
import Link from '../Link';
import { useImageGallery } from '../../../contexts/ImageGalleryContext';

export default function Action(props) {
    const { elementId, className, label, altText, url, showIcon, icon, iconPosition = 'right', style = 'primary' } = props;
    const IconComponent = icon ? iconMap[icon] : null;
    const fieldPath = props['data-sb-field-path'];
    const annotations = fieldPath
        ? { 'data-sb-field-path': [fieldPath, `${fieldPath}.url#@href`, `${fieldPath}.altText#@aria-label`, `${fieldPath}.elementId#@id`].join(' ').trim() }
        : {};
    const type = props.__metadata?.modelName;

    // Check if this is a gallery trigger
    const isGalleryTrigger = url?.startsWith('#gallery:');
    const galleryId = isGalleryTrigger ? url.replace('#gallery:', '') : null;

    // Use gallery context if available (only on client-side)
    let galleryContext = null;
    try {
        galleryContext = useImageGallery();
    } catch (e) {
        // Context not available (SSR or outside provider)
    }

    const handleClick = (e: React.MouseEvent) => {
        if (isGalleryTrigger && galleryContext && galleryId) {
            e.preventDefault();
            galleryContext.openGallery(galleryId);
        }
    };

    const buttonClasses = classNames(
        'sb-component',
        'sb-component-block',
        type === 'Button' ? 'sb-component-button' : 'sb-component-link',
        {
            'sb-component-button-primary': type === 'Button' && style === 'primary',
            'sb-component-button-secondary': type === 'Button' && style === 'secondary',
            'sb-component-link-primary': type === 'Link' && style === 'primary',
            'sb-component-link-secondary': type === 'Link' && style === 'secondary'
        },
        className
    );

    // If gallery trigger, render as button instead of link
    if (isGalleryTrigger) {
        return (
            <button
                onClick={handleClick}
                aria-label={altText}
                id={elementId}
                className={buttonClasses}
                {...annotations}
            >
                {label && <span {...(fieldPath && { 'data-sb-field-path': '.label' })}>{label}</span>}
                {showIcon && IconComponent && (
                    <IconComponent
                        className={classNames('shrink-0', 'fill-current', 'w-[1.25em]', 'h-[1.25em]', {
                            'order-first': iconPosition === 'left',
                            'mr-[0.5em]': label && iconPosition === 'left',
                            'ml-[0.5em]': label && iconPosition === 'right'
                        })}
                        {...(fieldPath && { 'data-sb-field-path': '.icon' })}
                    />
                )}
            </button>
        );
    }

    return (
        <Link
            href={url}
            aria-label={altText}
            id={elementId}
            className={buttonClasses}
            {...annotations}
        >
            {label && <span {...(fieldPath && { 'data-sb-field-path': '.label' })}>{label}</span>}
            {showIcon && IconComponent && (
                <IconComponent
                    className={classNames('shrink-0', 'fill-current', 'w-[1.25em]', 'h-[1.25em]', {
                        'order-first': iconPosition === 'left',
                        'mr-[0.5em]': label && iconPosition === 'left',
                        'ml-[0.5em]': label && iconPosition === 'right'
                    })}
                    {...(fieldPath && { 'data-sb-field-path': '.icon' })}
                />
            )}
        </Link>
    );
}
